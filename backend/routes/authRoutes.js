const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const {requireAdmin} = require("../middleware/roles");

router.post("/register",authController.register);
router.post("/login",authController.login);
router.get("/cashier-invite",authMiddleware,requireAdmin,authController.getCashierInvite);
router.post("/cashier-invite/regenerate",authMiddleware,requireAdmin,authController.regenerateCashierInvite);

module.exports = router;
