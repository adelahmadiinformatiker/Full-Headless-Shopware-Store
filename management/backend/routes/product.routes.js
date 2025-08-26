// management\backend\routes\product.routes.js
import { Router } from "express";
import {
  getAllProducts,
  postCreateProduct,
} from "../controllers/product.controller.js";

const router = Router();
console.info("###\tproduct.routes.js\n");
router.get("/", getAllProducts);
router.post("/create-product", postCreateProduct);

export default router;
