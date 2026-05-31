const express=require("express");
const router=express.Router();

const productController=require("../controllers/productController");
const {requireAdmin}=require("../middleware/roles");

router.get("/",productController.getProducts);

router.post("/",requireAdmin,productController.addProduct);

router.put("/:id",requireAdmin,productController.updateProduct);

router.delete("/:id",requireAdmin,productController.deleteProduct);

router.get("/search",productController.searchProducts);

router.get("/low-stock",productController.getLowStockProducts);

router.get("/barcode/:barcode",productController.getProductByBarcode);

module.exports=router;
