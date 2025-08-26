// controllers/product.controller.ts
import { listProducts } from "../services/product.service.js";

export async function getAllProducts(req, res) {
  try {
    const products = await listProducts();
    res.json(products);
  } catch (err) {
    console.error("❌ Failed to fetch products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
