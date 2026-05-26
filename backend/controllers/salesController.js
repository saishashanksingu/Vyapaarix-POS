const Sale=require("../models/Sale");
const Product=require("../models/Product");
const PDFDocument=require("pdfkit");
const {
    UNIT_LABELS,
    normalizeQuantity,
    validateQuantityForUnit,
    roundMoney
}=require("../utils/units");

exports.createSale=async(req,res)=>{
    try{
        const{items}=req.body;
        if(!Array.isArray(items) || items.length === 0){
            return res.status(400).json({message:"Sale must include at least one item"});
        }

        let total=0;
        const saleItems=[];
        const stockUpdates=[];

        for(let item of items){
            const quantity=normalizeQuantity(item.quantity);
            if(!item.productId){
                return res.status(400).json({message:"Product id is required for every item"});
            }

            const product=await Product.findById(item.productId);
            if(!product){
                return res.status(404).json({message:"Product not found"});
            }

            const quantityError=validateQuantityForUnit(quantity, product.unit);
            if(quantityError){
                return res.status(400).json({message:`${product.name}: ${quantityError}`});
            }

            if(product.stockQuantity<quantity){
                return res.status(400).json({message:`Insufficient stock for ${product.name}`});

            }

            const lineTotal=roundMoney(product.price*quantity);
            total=roundMoney(total+lineTotal);
            saleItems.push({
                productId:product._id,
                name:product.name,
                quantity,
                unit:product.unit,
                price:product.price,
                lineTotal
            });
            stockUpdates.push({productId:product._id, quantity});
        }

        const completedUpdates=[];
        for(const update of stockUpdates){
            const updatedProduct=await Product.findOneAndUpdate(
                {
                    _id:update.productId,
                    stockQuantity:{$gte:update.quantity}
                },
                {
                    $inc:{stockQuantity:-update.quantity}
                },
                {new:true}
            );

            if(!updatedProduct){
                for(const completed of completedUpdates){
                    await Product.findByIdAndUpdate(completed.productId,{
                        $inc:{stockQuantity:completed.quantity}
                    });
                }
                return res.status(400).json({message:"Insufficient stock. Please refresh inventory and try again."});
            }
            completedUpdates.push(update);
        }

        const sale=new Sale({
            items:saleItems,
            totalAmount:total
        });
        await sale.save();

        res.json({
            message:"Sale completed",
            sale
        })
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.getReceipt=async(req,res)=>{
    try{
        const sale=await Sale.findById(req.params.id);
        if(!sale){
            return res.status(404).json({message:"Sale not found"});
        }
        const receiptItems=sale.items.map((item)=>({
            name:item.name,
            price:item.price,
            quantity:item.quantity,
            unit:item.unit,
            unitLabel:UNIT_LABELS[item.unit] || item.unit,
            total:item.lineTotal || roundMoney(item.price*item.quantity)
        }));

        res.json({
            receiptId:sale._id,
            date:sale.createdAt,
            items:receiptItems,
            totalAmount:sale.totalAmount
        });

    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.downloadReceipt=async(req,res)=>{
    try{
        const sale= await Sale.findById(req.params.id);

        if(!sale){
            return res.status(404).json({message:"Sale not found"});

        }

        const doc=new PDFDocument();

        res.setHeader("Content-Type","application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=receipt-${sale._id}.pdf`
        );

        doc.pipe(res);

        doc.fontSize(20).text("Supermarket Receipt",{align:"center"});
        doc.moveDown();

        doc.fontSize(12).text(`Receipt ID: ${sale._id}`);
        doc.text(`Date:${sale.createdAt}`);
        doc.moveDown();

        sale.items.forEach((item)=>{
            const unitLabel=UNIT_LABELS[item.unit] || item.unit || "unit";
            doc.text(
                `${item.name} | Qty: ${item.quantity} ${unitLabel} | Rate: Rs.${item.price}/${unitLabel} | Total: Rs.${item.lineTotal || roundMoney(item.price*item.quantity)}`
            );
        });

        doc.moveDown();
        doc.text(`Total Amount: Rs.${sale.totalAmount}`);

        doc.end();
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.getAllSales=async(req,res)=>{
    try{
        const sales=await Sale.find().sort({createdAt:-1});
        res.json(sales);
    }catch(error){
        res.status(500).json({
            message:error.message
        });
    }
};



