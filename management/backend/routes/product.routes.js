// management/backend/routes/product.routes.js
import { Router } from "express";
import {
  getAllProducts,
  getProductByIdController,
  postCreateProduct,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";

const router = Router();

// Alle Produkte abrufen
router.get("/", getAllProducts);

// Einzelnes Produkt abrufen
router.get("/:id", getProductByIdController);

// Neues Produkt erstellen
router.post("/create-product", postCreateProduct);

// Produkt aktualisieren (PUT oder PATCH)
router.put("/:id", updateProductController);
// optional zusätzlich: router.patch("/:id", updateProductController);

// Produkt löschen
router.delete("/:id", deleteProductController);

export default router;
