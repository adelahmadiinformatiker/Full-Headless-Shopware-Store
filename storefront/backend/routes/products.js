// backend/routes/products.js
import express from "express";
import { ensureContextToken } from "../middlewares/contextToken.js";
import { fetchProducts } from "../services/shopwareStore.service.js";

const router = express.Router();

/**
 * GET /api/products
 * Query: page, limit, term
 */
router.get("/", ensureContextToken, async (req, res, next) => {
  try {
    const { page, limit, term } = req.query;
    const products = await fetchProducts(
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        term,
      },
      req.contextToken
    );

    res.json(products);
  } catch (err) {
    next(err);
  }
});

export default router;
