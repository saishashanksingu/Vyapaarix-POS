const mongoose=require("mongoose");

const storeSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    cashierInviteCode:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports=mongoose.model("Store",storeSchema);
