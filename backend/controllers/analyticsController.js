const Sale=require("../models/Sale");

exports.getTotalSales=async(req,res)=>{
    try{
        const sales=await Sale.find({store:req.user.store});
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
            {$match:{store:req.user.store}},
            {$unwind:"$items"},
            {
                $group:{
                    _id:{
                        name:"$items.name",
                        unit:"$items.unit"
                    },
                    totalSold:{$sum:"$items.quantity"}
                }
            },
            {
                $project:{
                    _id:0,
                    name:"$_id.name",
                    unit:"$_id.unit",
                    totalSold:1
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
                    store:req.user.store,
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
            {$match:{store:req.user.store}},
            {$unwind:"$items"},
            {
                $group:{
                    _id:{
                        productId:"$items.productId",
                        unit:"$items.unit"
                    },
                    totalSold:{$sum:"$items.quantity"}
                }
            },
            {
                $project:{
                    _id:"$_id.productId",
                    unit:"$_id.unit",
                    totalSold:1
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
            {$match:{store:req.user.store}},
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

exports.aiAssistant = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ message: "Question is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "Gemini API key is not configured on the server." });
        }

        const storeId = req.user.store.toString();

        const prompt1 = `You are an expert MongoDB data analyst for a supermarket POS store named Vyapaarix.
Your job is to translate a user's natural language question into a MongoDB aggregation pipeline array.

The database schemas are:
1. "User" model:
   - _id: ObjectId
   - name: String
   - email: String
   - role: String ("Admin" or "Cashier")
   - store: ObjectId (Reference to Store)
   - createdBy: ObjectId (Reference to User)

2. "Product" model:
   - _id: ObjectId
   - name: String
   - barcode: String
   - price: Number
   - unit: String (e.g. "piece", "kg")
   - stockQuantity: Number
   - minStockLimit: Number
   - store: ObjectId (Reference to Store)

3. "Sale" model:
   - _id: ObjectId
   - items: Array of objects:
     - productId: ObjectId (Reference to Product)
     - name: String
     - quantity: Number
     - unit: String
     - price: Number
     - lineTotal: Number
   - totalAmount: Number
   - store: ObjectId (Reference to Store)
   - cashier: ObjectId (Reference to User)
   - createdAt: Date

Rules:
- The store ID for the current store is "${storeId}".
- The very first stage of your pipeline MUST be a $match stage matching the current store: { "store": "${storeId}" }. Write "${storeId}" simply as a string in your JSON pipeline.
- Return a JSON object with two fields:
  - "collection": "Sale", "Product", or "User"
  - "pipeline": an array representing the MongoDB aggregation pipeline stages.
- If you need to match user.store or product.store, also match the string "${storeId}".
- Ensure the pipeline only performs read-only aggregates.

Example Question: "Which product sold the most quantity?"
Response JSON:
{
  "collection": "Sale",
  "pipeline": [
    { "$match": { "store": "${storeId}" } },
    { "$unwind": "$items" },
    { "$group": { "_id": "$items.productId", "name": { "$first": "$items.name" }, "totalQty": { "$sum": "$items.quantity" } } },
    { "$sort": { "totalQty": -1 } },
    { "$limit": 1 }
  ]
}

User Question: "${question}"
Return ONLY the JSON. Do not include markdown code block formatting.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Step 1: Call Gemini to generate the aggregation pipeline
        const response1 = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt1 }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data1 = await response1.json();
        const generatedText = data1.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error("Failed to generate pipeline from Gemini: " + JSON.stringify(data1));
        }

        const { collection, pipeline } = JSON.parse(generatedText);

        // Validate collection & select correct Mongoose model
        const Product = require("../models/Product");
        const User = require("../models/User");
        
        let model;
        if (collection === "Sale") model = Sale;
        else if (collection === "Product") model = Product;
        else if (collection === "User") model = User;
        else {
            throw new Error(`Invalid collection generated: ${collection}`);
        }

        // Convert string store IDs to Mongoose ObjectIds inside the pipeline
        const processedPipeline = JSON.parse(JSON.stringify(pipeline), (key, value) => {
            if (typeof value === "string" && value.length === 24 && /^[0-9a-fA-F]{24}$/.test(value)) {
                return new mongoose.Types.ObjectId(value);
            }
            return value;
        });

        // Execute aggregation query
        const dbResult = await model.aggregate(processedPipeline);

        // Step 2: Feed results back to Gemini for summary/explanation
        const prompt2 = `You are the Vyapaarix POS AI assistant. You just queried the database to answer a store manager's question.
Manager's Question: "${question}"
Executed Pipeline: ${JSON.stringify(pipeline)}
Database Result: ${JSON.stringify(dbResult)}

Please write a friendly, professional response explaining the results clearly. If formatting helps (like bullet points or simple lists), use it. Keep the response concise but highly informative. If no data was returned, explain that no matches were found.`;

        const response2 = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt2 }] }]
            })
        });

        const data2 = await response2.json();
        const finalAnswer = data2.candidates?.[0]?.content?.parts?.[0]?.text;

        res.json({
            answer: finalAnswer || "Failed to formulate explanation.",
            query: { collection, pipeline },
            rawResult: dbResult
        });

    } catch (error) {
        console.error("AI Assistant error:", error);
        res.status(500).json({ message: "AI Assistant failed to resolve query", error: error.message });
    }
};



