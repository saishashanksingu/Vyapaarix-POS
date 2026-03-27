const Product=require("../models/Product");

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
        const product=new Product(req.body);
        const savedProduct=await product.save();
        res.json(savedProduct);
    }catch(error){
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
            stockQuantity:{$lte:5}
        });
        res.json(lowStockProducts);

    }catch(error){
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




