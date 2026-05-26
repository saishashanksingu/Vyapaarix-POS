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
        trim:true,
        unique:true
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
    }
});

module.exports=mongoose.model("Product",ProductSchema);
