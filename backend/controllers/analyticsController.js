const mongoose = require("mongoose");
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

        const Product = require("../models/Product");
        const User = require("../models/User");

        // Fetch live store metadata to inject as real-time context
        const [products, cashiers] = await Promise.all([
            Product.find({ store: req.user.store }).select("name barcode price unit reorderLevel stockQuantity").limit(100),
            User.find({ store: req.user.store }).select("name email role")
        ]);

        const storeMetadata = {
            cashiers: cashiers.map(c => ({ id: c._id.toString(), name: c.name, role: c.role })),
            products: products.map(p => ({
                name: p.name,
                barcode: p.barcode,
                price: p.price,
                unit: p.unit || "piece",
                stock: p.stockQuantity,
                reorderLevel: p.reorderLevel
            }))
        };

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
   - price: Number (Selling price)
   - unit: String (e.g. "piece", "liter", "kg", "box")
   - stockQuantity: Number
   - reorderLevel: Number (When stockQuantity <= reorderLevel, the product is low on stock and needs restocking)
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
- Return a JSON object with three fields:
  - "collection": "Sale", "Product", "User", or "General" (use "General" if the question is a general conversational query, retail advice, or recommendation that does not require database querying).
  - "pipeline": an array representing the MongoDB aggregation pipeline stages (empty array [] for "General").
  - "answer": (ONLY for "General" collection) A professional, highly informative, and easy-to-read response answering the manager's question directly with expert retail advice. Use structured markdown tables, bullet points, bold key metrics, and an actionable, warm tone. Leave this field empty or omit it if the collection is "Sale", "Product", or "User".
- If you need to match user.store or product.store, also match the string "${storeId}".
- Ensure the pipeline only performs read-only aggregates.

Here is the live metadata for the current store. Use these exact cashier/user IDs and product details to answer the user's question with 100% precision:
- Cashiers/Users: ${JSON.stringify(storeMetadata.cashiers)}
- Active Products: ${JSON.stringify(storeMetadata.products)}

Supermarket Business Metrics Definitions:
- "Low stock" or "needs restocking": Products where stockQuantity <= reorderLevel.
- "Inventory Value": Sum of (stockQuantity * price) across all Products.
- "Total Revenue": Sum of totalAmount across all Sales.
- "Average Order Value (AOV)" or "Average Transaction Value/Basket Size": The total revenue divided by the total number of sales transactions.
- "Sales by Cashier": Group Sales by cashier, sum totalAmount, and sort descending.

Few-Shot Translation Examples:

Example 1: "What is the total value of our inventory?"
Response JSON:
{
  "collection": "Product",
  "pipeline": [
    { "$match": { "store": "${storeId}" } },
    { "$group": { "_id": null, "totalValue": { "$sum": { "$multiply": ["$stockQuantity", "$price"] } } } }
  ]
}

Example 2: "Which products are low on stock and need restocking?"
Response JSON:
{
  "collection": "Product",
  "pipeline": [
    { "$match": { "store": "${storeId}", "$expr": { "$lte": ["$stockQuantity", "$reorderLevel"] } } }
  ]
}

Example 3: "What is our average order value?"
Response JSON:
{
  "collection": "Sale",
  "pipeline": [
    { "$match": { "store": "${storeId}" } },
    { "$group": { "_id": null, "totalRevenue": { "$sum": "$totalAmount" }, "transactionCount": { "$sum": 1 } } },
    { "$project": { "averageOrderValue": { "$divide": ["$totalRevenue", "$transactionCount"] } } }
  ]
}

Example 4: "Compare cashier performance stats"
Response JSON:
{
  "collection": "Sale",
  "pipeline": [
    { "$match": { "store": "${storeId}" } },
    { "$group": { "_id": "$cashier", "totalSales": { "$sum": "$totalAmount" }, "transactionCount": { "$sum": 1 } } },
    { "$sort": { "totalSales": -1 } }
  ]
}

Example 5: "How much Milk did we sell?" (Uses case-insensitive regex match for product names)
Response JSON:
{
  "collection": "Sale",
  "pipeline": [
    { "$match": { "store": "${storeId}" } },
    { "$unwind": "$items" },
    { "$match": { "items.name": { "$regex": "Milk", "$options": "i" } } },
    { "$group": { "_id": null, "totalQuantity": { "$sum": "$items.quantity" }, "totalRevenue": { "$sum": "$items.lineTotal" } } }
  ]
}

Example 6: "what are best new add on product suggestions for our store" (General recommendation query with direct answer)
Response JSON:
{
  "collection": "General",
  "pipeline": [],
  "answer": "Hello! Promoting the right add-on products is key to increasing basket size. Here are some top suggestions:\n\n### **Top Add-On Suggestions**\n| Category | Specific Items | Why it works |\n| :--- | :--- | :--- |\n| **Impulse Buys** | Premium chocolates, pocket hand sanitizers, unique mints | High margin, placed near registers. |\n| **Healthy Grab & Go** | Protein bars, kombucha, nut mixes | Health-conscious shoppers buy these on the go. |\n| **Eco-Kitchen** | Reusable bags, beeswax wraps | Appeals to green-minded customers. |"
}

User Question: "${question}"
Return ONLY the JSON. Do not include markdown code block formatting.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // Step 1: Call Gemini to generate the aggregation pipeline
        const response1 = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt1 }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (response1.status !== 200) {
            const errData = await response1.json().catch(() => ({}));
            console.error("Gemini API Step 1 error:", response1.status, errData);
            throw new Error(`Gemini API Step 1 returned status ${response1.status}: ${errData.error?.message || JSON.stringify(errData)}`);
        }

        const data1 = await response1.json();
        const generatedText = data1.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
            throw new Error("Failed to generate pipeline from Gemini: " + JSON.stringify(data1));
        }

        // Clean up markdown block wrappers if present (e.g. ```json ... ```)
        let cleanedText = generatedText.trim();
        if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "");
        }

        let collection = "General";
        let pipeline = [];
        let directAnswer = null;

        try {
            const parsed = JSON.parse(cleanedText);
            collection = parsed.collection || "General";
            pipeline = parsed.pipeline || [];
            directAnswer = parsed.answer || null;
        } catch (parseError) {
            // If the response is not valid JSON, treat it as a direct conversational explanation from Gemini
            console.log("Gemini returned a non-JSON response, using directly as the answer.");
            return res.json({
                answer: cleanedText,
                query: { collection: "General", pipeline: [] },
                rawResult: []
            });
        }
        
        // If it's a general query and Gemini already formulated a direct answer, return it immediately!
        // This cuts response time in half and avoids a redundant second API call.
        if (collection === "General" && directAnswer) {
            return res.json({
                answer: directAnswer,
                query: { collection, pipeline },
                rawResult: []
            });
        }

        let dbResult = [];

        if (collection !== "General") {
            let model;
            if (collection === "Sale") model = Sale;
            else if (collection === "Product") model = Product;
            else if (collection === "User") model = User;
            else {
                // If it generated an unrecognized collection, fall back to General
                collection = "General";
            }

            if (collection !== "General" && model) {
                // Convert string store IDs to Mongoose ObjectIds inside the pipeline
                const processedPipeline = JSON.parse(JSON.stringify(pipeline), (key, value) => {
                    if (typeof value === "string" && value.length === 24 && /^[0-9a-fA-F]{24}$/.test(value)) {
                        return new mongoose.Types.ObjectId(value);
                    }
                    return value;
                });

                // Execute aggregation query
                dbResult = await model.aggregate(processedPipeline);
            }
        }

        // Step 2: Feed results back to Gemini for summary/explanation
        let prompt2;
        if (collection === "General") {
            prompt2 = `You are the Vyapaarix POS AI assistant, an expert retail consultant helping a supermarket manager run their store efficiently.
The manager asked a general retail, business, or recommendation question.

Manager's Question: "${question}"

Please write a professional, highly informative, and easy-to-read response answering their question and providing expert advice.
Guidelines:
1. **Format Elegantly:** Use structured markdown tables, bullet points, or bold text. Do not return plain blocks of text.
2. **Be Actionable:** Translate your retail knowledge into concrete business insights or suggestions the manager can implement immediately.
3. **Tone:** Warm, professional, supportive, and business-focused.
4. Keep the response concise but highly valuable.`;
        } else {
            prompt2 = `You are the Vyapaarix POS AI assistant, an expert retail consultant helping a supermarket manager run their store efficiently.
You just queried the database to answer the manager's question.

Manager's Question: "${question}"
Database Result: ${JSON.stringify(dbResult)}

Please write a professional, highly informative, and easy-to-read response explaining these results.
Guidelines:
1. **Format Elegantly:** Use structured markdown tables, bullet points, or bold text for key metrics. Do not return plain blocks of text.
2. **Be Actionable:** Translate raw database numbers into business insights.
   - For example, if products are low on stock, warn the manager and suggest restocking them.
   - If a cashier has outstanding sales, highlight their performance.
   - If a product is selling fast, note that it's a popular item.
3. **Handle Empty Results:** If no data was returned, explain clearly that no records matched their search, and suggest what they could check or do next.
4. **Tone:** Warm, professional, supportive, and business-focused. Use currency formatting (e.g. Rs. or $) for monetary values where applicable.
5. Keep the response concise but highly valuable.`;
        }

        const response2 = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt2 }] }]
            })
        });

        if (response2.status !== 200) {
            const errData = await response2.json().catch(() => ({}));
            console.error("Gemini API Step 2 error:", response2.status, errData);
            throw new Error(`Gemini API Step 2 returned status ${response2.status}: ${errData.error?.message || JSON.stringify(errData)}`);
        }

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



