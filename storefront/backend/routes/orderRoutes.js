// external-node-layer/club-manager-sync/routes/orderRoutes.js
import express from "express";
import { getOrderByNumber } from "../services/orderStorage.js";

const router = express.Router();

router.get("/:orderNumber", (req, res) => {
  const orderNumber = req.params.orderNumber;
  const order = getOrderByNumber(orderNumber);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
});

export default router;
