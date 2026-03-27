const Sale=require("../models/Sale");

exports.getTotalSales=async(req,res)=>{
    try{
        const sales=await Sale.find();
        let totalRevenue=0;
        sales.forEach((sale)=>{
            totalRevenue+=sale.totalAmount;
        });
        res.json({
            totalSales:sales.length,
            totalRevenue:totalRevenue
        });
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.getTopProducts=async(req,res)=>{
    try{
        const topProducts=await Sale.aggregate([
            {$unwind:"$items"},
            {
                $group:{
                    _id:"$items.name",
                    totalSold:{$sum:"$items.quantity"}
                }
            },
            {$sort:{totalSold:-1}},
            {$limit:5}
        ]);
        res.json(topProducts);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.getDailySales=async(req,res)=>{
    try{
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const sales = await Sale.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        res.json(sales);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.getTopSellingProducts=async(req,res)=>{
    try{
        const topProducts=await Sale.aggregate([
            {$unwind:"$items"},
            {
                $group:{
                    _id:"$items.productId",
                    totalSold:{$sum:"$items.quantity"}
                }
            },
            {
                $sort:{totalSold:-1}
            },
            {$limit:5}

        ]);
        res.json(topProducts);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

exports.getMonthlySales=async(req, res)=>{
    try{
        const sales = await Sale.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalSales: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        res.json(sales);

    }catch(error){
        res.status(500).json({message:error.message});
    }
};


