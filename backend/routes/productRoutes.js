const express=require("express");
const router=express.Router();

const productController=require("../controllers/productController");

router.get("/",productController.getProducts);

router.post("/",productController.addProduct);

router.put("/:id",productController.updateProduct);

router.delete("/:id",productController.deleteProduct);

router.get("/search",productController.searchProducts);

router.get("/low-stock",productController.getLowStockProducts);

router.get("/barcode/:barcode",productController.getProductByBarcode);

module.exports=router;