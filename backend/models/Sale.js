const mongoose=require("mongoose");

const saleSchema=new mongoose.Schema({
    items:[
        {
            productId:String,
            name:String,
            quantity:Number,
            price:Number
        }
    ],
    totalAmount:Number,
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports=mongoose.model("Sale",saleSchema);