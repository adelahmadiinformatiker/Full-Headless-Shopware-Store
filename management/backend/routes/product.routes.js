// routes/product.routes.ts
import { Router } from "express";
import { getAllProducts } from "../controllers/product.controller.js";

const router = Router();

router.get("/produc", getAllProducts);

// Export the router to be used in the main app

export default router;
