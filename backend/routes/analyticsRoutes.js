const express=require("express");
const router=express.Router();
const analyticsController=require("../controllers/analyticsController");
router.get("/summary",analyticsController.getTotalSales);
router.get("/top-products",analyticsController.getTopProducts);
router.get("/daily-report",analyticsController.getDailySales);
router.get("/top-products",analyticsController.getTopSellingProducts);
router.get("/monthly-sales",analyticsController.getMonthlySales);
router.post("/assistant",analyticsController.aiAssistant);

module.exports=router;