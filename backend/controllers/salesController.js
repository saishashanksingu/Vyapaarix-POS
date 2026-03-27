const Sale=require("../models/Sale");
const Product=require("../models/Product");
const PDFDocument=require("pdfkit");

exports.createSale=async(req,res)=>{
    try{
        const{items}=req.body;
        let total=0;
        for(let item of items){
            const product=await Product.findById(item.productId);
            if(!product){
                return res.status(404).json({message:"Product not found"});
            }
            if(product.stockQuantity<item.quantity){
                return res.status(400).json({message:"Insufficient stock"});

            }
            product.stockQuantity-=item.quantity;
            await product.save();

            total+=item.price*item.quantity;
        }

        const sale=new Sale({
            items,
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
            total:item.price*item.quantity
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
            doc.text(
                `Product ID: ${item.productId} | Qty: ${item.quantity} | Price: ${item.price}`
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



