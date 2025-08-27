// backend/routes/cart.routes.js
import express from "express";
import { ensureContextToken } from "../middlewares/contextToken.js";
import {
  addItemToCart,
  getCart,
  removeItemFromCart,
} from "../services/cartService.js";

const router = express.Router();

// GET /api/checkout/cart
router.get("/checkout/cart", ensureContextToken, async (req, res, next) => {
  try {
    console.log(
      "[BFF] GET /checkout/cart token(header,cookie,req.contextToken) =",
      req.get("sw-context-token"),
      req.cookies?.["sw-context-token"],
      req.contextToken
    );

    const cart = await getCart(req.contextToken);
    res.set("sw-context-token", req.contextToken);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// POST /api/checkout/cart/line-item
router.post(
  "/checkout/cart/line-item",
  ensureContextToken,
  async (req, res, next) => {
    try {
      const token = req.contextToken;

      console.log(
        "[BFF] POST /checkout/cart/line-item token(header,cookie,req.contextToken) =",
        req.get("sw-context-token"),
        req.cookies?.["sw-context-token"],
        token,
        " body:",
        JSON.stringify(req.body)
      );

      // Support both shapes: items[] or single productId
      const items = Array.isArray(req.body?.items) ? req.body.items : null;

      if (items && items.length) {
        for (const it of items) {
          const productId = it.referencedId || it.id || it.productId;
          const qty = Number(it.quantity ?? 1);
          if (!productId) continue;
          await addItemToCart(token, productId, qty);
        }
        const cart = await getCart(token);
        res.set("sw-context-token", token);
        return res.status(201).json(cart);
      }

      const { productId, quantity = 1 } = req.body || {};
      if (!productId) {
        return res
          .status(400)
          .json({ message: "productId or items[] required" });
      }

      const result = await addItemToCart(token, productId, Number(quantity));
      res.set("sw-context-token", token);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/checkout/cart/line-item/:lineItemId
router.delete(
  "/checkout/cart/line-item/:lineItemId",
  ensureContextToken,
  async (req, res, next) => {
    try {
      const token = req.contextToken;
      const { lineItemId } = req.params;

      console.log(
        "[BFF] DELETE /checkout/cart/line-item token(header,cookie,req.contextToken) =",
        req.get("sw-context-token"),
        req.cookies?.["sw-context-token"],
        token,
        " lineItemId:",
        lineItemId
      );

      await removeItemFromCart(token, lineItemId);
      const cart = await getCart(token);
      res.set("sw-context-token", token);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
