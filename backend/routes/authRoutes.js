const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const {requireAdmin} = require("../middleware/roles");

router.post("/register",authController.register);
router.post("/login",authController.login);
router.get("/cashier-invite",authMiddleware,requireAdmin,authController.getCashierInvite);
router.post("/cashier-invite/regenerate",authMiddleware,requireAdmin,authController.regenerateCashierInvite);

// Cashiers Tracking (Admin only)
router.get("/cashiers",authMiddleware,requireAdmin,authController.getCashiers);
router.get("/cashiers/:id",authMiddleware,requireAdmin,authController.getCashierDetails);

// Password Management
router.post("/change-password",authMiddleware,authController.changePassword);
router.post("/forgot-password",authController.forgotPassword);
router.post("/reset-password",authController.resetPassword);

module.exports = router;
