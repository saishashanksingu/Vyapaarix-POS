const mongoose=require("mongoose");
const {VALID_UNITS}=require("../utils/units");

const ProductSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    barcode:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    stockQuantity:{
        type:Number,
        default:0,
        required:true,
        min:0
    },
    unit:{
        type:String,
        enum:VALID_UNITS,
        default:'piece'
    },
    reorderLevel:{
        type:Number,
        default:10,
        min:0
    },
    store:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Store",
        required:true,
        index:true
    }
});

ProductSchema.index({store:1, barcode:1}, {unique:true});

module.exports=mongoose.model("Product",ProductSchema);
