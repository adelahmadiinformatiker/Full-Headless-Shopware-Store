// backend/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import listEndpoints from "express-list-endpoints";

import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import productsRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.routes.js";

import { ensureContextToken } from "./middlewares/contextToken.js";
import { errorHandler } from "./middlewares/error.js";
import {
  getCart,
  addItemToCart,
  removeItemFromCart,
} from "./services/cartService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// ───────────────────────── Middlewares
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// ───────────────────────── (Optional) Expose headers for access tokens in responses
app.use((req, res, next) => {
  res.set("Access-Control-Expose-Headers", "sw-context-token");
  next();
});

// ───────────────────────── Health
app.get("/ping", (_req, res) => {
  res.send("🟢 Storefront BFF is running.");
});

// ───────────────────────── Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);

// ───────────────────────── List all routes (debug)
app.get("/api/_routes", (req, res) => res.json(listEndpoints(app)));

// ───────────────────────── Aliases for compatibility with the old frontend (/api/checkout/cart)
app.post("/api/checkout/cart", ensureContextToken, async (req, res, next) => {
  try {
    const token = req.contextToken;
    const cart = await getCart(token);
    res.set("sw-context-token", token);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

app.get("/api/checkout/cart", ensureContextToken, async (req, res, next) => {
  try {
    const token = req.contextToken;
    const cart = await getCart(token);
    res.set("sw-context-token", token);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

// ───────────────────────── Aliases for Adding and Removing Cart Line Items
app.post(
  "/api/checkout/cart/line-item",
  ensureContextToken,
  async (req, res, next) => {
    try {
      const token = req.contextToken;
      const items = Array.isArray(req.body?.items) ? req.body.items : [];
      if (!items.length)
        return res.status(400).json({ message: "items[] required" });

      for (const it of items) {
        const productId = it.referencedId || it.id || it.productId;
        const qty = Number(it.quantity ?? 1);
        if (productId) await addItemToCart(token, productId, qty);
      }
      const cart = await getCart(token);
      res.set("sw-context-token", token);
      res.status(201).json(cart);
    } catch (err) {
      next(err);
    }
  }
);

app.post(
  "/api/checkout/cart/line-item/delete",
  ensureContextToken,
  async (req, res, next) => {
    try {
      const token = req.contextToken;
      const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
      if (!ids.length)
        return res.status(400).json({ message: "ids[] required" });

      for (const id of ids) await removeItemFromCart(token, id);
      const cart = await getCart(token);
      res.set("sw-context-token", token);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  }
);

// ───────────────────────── 404 JSON (prevent Unexpected '<')
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// ───────────────────────── Error handler (latest middleware)
app.use(errorHandler);

// ───────────────────────── Start
app.listen(PORT, () => {
  console.log(`[BFF] listening on http://localhost:${PORT}`);
  console.log(`[BFF] CORS origin: ${CORS_ORIGIN}`);
});
