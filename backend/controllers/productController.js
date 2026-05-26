const Product=require("../models/Product");
const {VALID_UNITS, normalizeQuantity, validateQuantityForUnit}=require("../utils/units");

const normalizeProductPayload=(body)=>({
    name:String(body.name || "").trim(),
    barcode:String(body.barcode || "").trim(),
    price:Number(body.price),
    stockQuantity:normalizeQuantity(body.stockQuantity),
    unit:body.unit || "piece",
    reorderLevel:body.reorderLevel === undefined ? 10 : normalizeQuantity(body.reorderLevel)
});

const validateProductPayload=(payload)=>{
    if(!payload.name || !payload.barcode){
        return "Please provide product name and barcode";
    }
    if(!Number.isFinite(payload.price) || payload.price < 0){
        return "Please provide a valid price";
    }
    if(!VALID_UNITS.includes(payload.unit)){
        return "Please provide a valid unit";
    }
    if(!Number.isFinite(payload.stockQuantity) || payload.stockQuantity < 0){
        return "Please provide a valid stock quantity";
    }
    if(!Number.isFinite(payload.reorderLevel) || payload.reorderLevel < 0){
        return "Please provide a valid reorder level";
    }

    const stockError=validateQuantityForUnit(payload.stockQuantity || 1, payload.unit);
    if(stockError){
        return stockError;
    }

    return validateQuantityForUnit(payload.reorderLevel || 1, payload.unit);
};

exports.getProducts=async(req,res)=>{
    try{
        const products=await Product.find();
        res.json(products);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.addProduct=async(req,res)=>{
    try{
        const payload=normalizeProductPayload(req.body);
        const validationError=validateProductPayload(payload);
        if(validationError){
            return res.status(400).json({message:validationError});
        }

        const product=new Product(payload);
        const savedProduct=await product.save();
        res.json(savedProduct);
    }catch(error){
        if(error.code === 11000){
            return res.status(409).json({message:"Barcode already exists"});
        }
        res.status(500).json({message:error.message});
    }
};

exports.searchProducts=async(req,res)=>{
    try{
        const keyword=req.query.name;
        const products=await Product.find({
            name:{$regex:keyword,$options:"i"}
        });
        res.json(products);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.getLowStockProducts=async(req,res)=>{
    try{
        const lowStockProducts=await Product.find({
            $expr:{$lte:["$stockQuantity","$reorderLevel"]}
        });
        res.json(lowStockProducts);

    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.updateProduct=async(req,res)=>{
    try{
        const {id}=req.params;
        const payload=normalizeProductPayload(req.body);
        const validationError=validateProductPayload(payload);
        
        if(validationError){
            return res.status(400).json({message:validationError});
        }
        
        const product=await Product.findByIdAndUpdate(
            id,
            payload,
            {new:true,runValidators:true}
        );
        
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        
        res.json(product);
    }catch(error){
        console.error("Error updating product:", error);
        if(error.code === 11000){
            return res.status(409).json({message:"Barcode already exists"});
        }
        res.status(500).json({message:error.message});
    }
};

exports.deleteProduct=async(req,res)=>{
    try{
        console.log("Deleting product with id:", req.params.id);
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({message:"Product not found"});
        }
        res.json({message:"Product deleted"});
    }catch(error){
        console.error("Error deleting product:", error);
        res.status(500).json({message:error.message});
    }
};

exports.getProductByBarcode=async(req,res)=>{
    console.log('GET /api/products/barcode/:barcode called with', req.params.barcode);
    try{
        const product=await Product.findOne({
            barcode:req.params.barcode
        });

        if(!product){
            console.log('Product not found for barcode', req.params.barcode);
            return res.status(404).json({
                message:"Product Not Found"
            });
        }

        console.log('Product found for barcode', req.params.barcode, product);
        res.json(product);
    }catch(error){
        console.error("Error fetching product by barcode:", error);
        res.status(500).json({
            message:error.message
        });
    }
};




