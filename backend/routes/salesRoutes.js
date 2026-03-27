const express=require("express");
const router=express.Router();
const salesController=require("../controllers/salesController");

router.post("/",salesController.createSale);
router.get("/receipt/:id",salesController.getReceipt);
router.get("/receipt-pdf/:id",salesController.downloadReceipt);
router.get("/",salesController.getAllSales);

module.exports=router;

