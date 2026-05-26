const mongoose=require("mongoose");
const {VALID_UNITS}=require("../utils/units");

const saleSchema=new mongoose.Schema({
    items:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                min:0
            },
            unit:{
                type:String,
                enum:VALID_UNITS,
                default:'piece',
                required:true
            },
            price:{
                type:Number,
                required:true,
                min:0
            },
            lineTotal:{
                type:Number,
                required:true,
                min:0
            }
        }
    ],
    totalAmount:{
        type:Number,
        required:true,
        min:0
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports=mongoose.model("Sale",saleSchema);
