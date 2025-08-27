import express from "express";
import { handleOrderPaid } from "../controllers/webhookController.js";

const router = express.Router();
router.post("/order-paid", handleOrderPaid);

export default router;
