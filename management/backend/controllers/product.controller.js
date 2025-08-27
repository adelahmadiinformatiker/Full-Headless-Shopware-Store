// management/backend/controllers/product.controller.js
import {
  listProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";

// Alle Produkte abrufen
export async function getAllProducts(req, res) {
  try {
    const products = await listProducts();
    return res.json({ success: true, data: products });
  } catch (err) {
    console.error("❌ Failed to fetch products:", err.message);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch products" });
  }
}

// Einzelnes Produkt abrufen
export async function getProductByIdController(req, res) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    return res.json({ success: true, data: product });
  } catch (err) {
    console.error("❌ Failed to fetch product:", err.message);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch product" });
  }
}

// Neues Produkt erstellen
export async function postCreateProduct(req, res) {
  try {
    const result = await createProduct(req.body);

    if (result?.success) {
      return res.status(201).json(result);
    }
    if (result?.errors) {
      return res.status(400).json(result);
    }

    return res
      .status(500)
      .json({ success: false, error: "Unknown create error" });
  } catch (err) {
    const sw = err.response?.data;
    const apiErrors = sw?.errors;
    const status = err.response?.status;
    const message = apiErrors?.[0]?.detail || err.message || "Unexpected error";

    if (status === 400 || status === 409 || status === 422) {
      return res
        .status(400)
        .json({ success: false, errors: apiErrors || [{ detail: message }] });
    }
    if (status === 404) {
      return res
        .status(404)
        .json({ success: false, errors: apiErrors || [{ detail: message }] });
    }
    if (status === 500 && apiErrors) {
      return res.status(400).json({
        success: false,
        errors: apiErrors,
        hint: "Check related IDs such as taxId/manufacturerId and ensure they exist.",
      });
    }

    console.error("❌ Failed to create product:", sw || message);
    return res.status(500).json({
      success: false,
      error: "Failed to create product",
      details: apiErrors || [{ detail: message }],
    });
  }
}

// Produkt aktualisieren
export async function updateProductController(req, res) {
  try {
    const result = await updateProduct(req.params.id, req.body);

    if (result?.success) {
      return res.json(result);
    }
    return res.status(400).json({ success: false, error: "Update failed" });
  } catch (err) {
    console.error(
      "❌ Failed to update product:",
      err.response?.data || err.message
    );
    return res
      .status(500)
      .json({ success: false, error: "Failed to update product" });
  }
}

// Produkt löschen
export async function deleteProductController(req, res) {
  try {
    const result = await deleteProduct(req.params.id);

    if (result?.success) {
      return res.json(result);
    }
    return res.status(404).json({ success: false, error: "Product not found" });
  } catch (err) {
    console.error(
      "❌ Failed to delete product:",
      err.response?.data || err.message
    );
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete product" });
  }
}
