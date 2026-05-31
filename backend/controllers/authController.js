const User=require("../models/User");
const Store=require("../models/Store");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");

const sanitizeUser=(user)=>({
    _id:user._id,
    name:user.name,
    email:user.email,
    role:user.role,
    store:user.store,
    createdBy:user.createdBy
});

const createInviteCode=()=>crypto.randomBytes(4).toString("hex").toUpperCase();

const signToken=(user)=>jwt.sign(
    {id:user._id,role:user.role,store:user.store},
    process.env.JWT_SECRET,
    {expiresIn:"1d"}
);

exports.register=async(req,res)=>{
    try{
        const {name,email,password,role,storeName,inviteCode}=req.body;
        const requestedRole=role === "Admin" ? "Admin" : "Cashier";
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        if(!name || !email || !password){
            return res.status(400).json({message:"Name, email and password are required"});
        }

        const hashedPassword=await bcrypt.hash(password,10);

        if(requestedRole === "Admin"){
            const store=await Store.create({
                name:String(storeName || `${name}'s Store`).trim(),
                cashierInviteCode:createInviteCode()
            });

            const user=await User.create({
                name,
                email,
                password:hashedPassword,
                role:"Admin",
                store:store._id
            });

            store.owner=user._id;
            await store.save();

            const token=signToken(user);
            return res.json({
                token,
                user:sanitizeUser(user),
                store:{
                    _id:store._id,
                    name:store.name,
                    cashierInviteCode:store.cashierInviteCode
                }
            });
        }

        const store=await Store.findOne({
            cashierInviteCode:String(inviteCode || "").trim().toUpperCase()
        });
        if(!store){
            return res.status(400).json({message:"A valid store invite code is required for cashier registration"});
        }

        const user=await User.create({
            name,
            email,
            password:hashedPassword,
            role:"Cashier",
            store:store._id,
            createdBy:store.owner
        });
        const token=signToken(user);
        res.json({token,user:sanitizeUser(user),store:{_id:store._id,name:store.name}});

    }catch(error){
        if(error.code === 11000){
            return res.status(409).json({message:"A store or user with those details already exists"});
        }
        res.status(500).json({message:error.message});
    }
};

exports.login=async(req,res)=>{
    try{
        const{email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid Password"});
        }

        if(!user.store && user.role === "Admin"){
            const store=await Store.create({
                name:`${user.name}'s Store`,
                owner:user._id,
                cashierInviteCode:createInviteCode()
            });
            user.store=store._id;
            await user.save();
        }

        if(!user.store){
            return res.status(403).json({message:"User is not assigned to a store"});
        }

        const store=await Store.findById(user.store);
        const token=signToken(user);
        res.json({
            token,
            user:sanitizeUser(user),
            store:store ? {
                _id:store._id,
                name:store.name,
                cashierInviteCode:user.role === "Admin" ? store.cashierInviteCode : undefined
            } : undefined
        });

    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.getCashierInvite=async(req,res)=>{
    try{
        const store=await Store.findById(req.user.store);
        if(!store){
            return res.status(404).json({message:"Store not found"});
        }

        res.json({
            storeId:store._id,
            storeName:store.name,
            cashierInviteCode:store.cashierInviteCode
        });
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.regenerateCashierInvite=async(req,res)=>{
    try{
        const store=await Store.findById(req.user.store);
        if(!store){
            return res.status(404).json({message:"Store not found"});
        }

        store.cashierInviteCode=createInviteCode();
        await store.save();

        res.json({
            storeId:store._id,
            storeName:store.name,
            cashierInviteCode:store.cashierInviteCode
        });
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

