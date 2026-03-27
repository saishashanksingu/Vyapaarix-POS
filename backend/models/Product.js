const mongoose=require("mongoose");

const ProductSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    barcode:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stockQuantity:{
        type:Number,
        default:0,
        required:true
    },
    reorderLevel:{
        type:Number,
        default:10
    }
});

module.exports=mongoose.model("Product",ProductSchema);