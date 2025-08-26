// management\backend\controllers\product.controller.js
import { listProducts, createProduct } from "../services/product.service.js";

// All Products
export async function getAllProducts(req, res) {
  console.info("###\tproduct.controller.js\n");

  try {
    debugger;
    const products = await listProducts();
    res.json(products);
  } catch (err) {
    console.error("❌ Failed to fetch products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

// Create a new Product (controller)
// - Returns 201 with {id} on success
// - Bubbles up Shopware API errors with 4xx where reasonable
// - Maps common server-side FK/validation problems to 400 for faster debugging

export async function postCreateProduct(req, res) {
  try {
    const result = await createProduct(req.body);

    // Service can return the created id (string) OR an object with errors from SW
    if (typeof result === "string") {
      return res.status(201).json({ success: true, id: result });
    }
    if (result?.errors) {
      return res.status(400).json({ success: false, errors: result.errors });
    }

    return res
      .status(500)
      .json({ success: false, error: "Unknown create error" });
  } catch (err) {
    // Prefer Shopware-style error payload if present
    const sw = err.response?.data;
    const apiErrors = sw?.errors;
    const status = err.response?.status;
    const message = apiErrors?.[0]?.detail || err.message || "Unexpected error";

    // 1) Client-side validation thrown by service (missing required fields, bad price, etc.)
    const validationHints = [
      "name is required",
      "productNumber is required",
      "stock is required",
      "price is required",
      "price must be",
      "No taxId provided",
      "default tax not found",
    ];
    if (validationHints.some((h) => message.includes(h))) {
      return res.status(400).json({ success: false, error: message });
    }

    // 2) Known Shopware/HTTP mappings
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

    // 3) Common DB FK issues (e.g., MySQL 1452 on tax_id/manufacturerId)
    // Shopware often wraps these as 500 with details in errors[]
    if (status === 500 && apiErrors) {
      return res.status(400).json({
        success: false,
        errors: apiErrors,
        hint: "Check related IDs such as taxId/manufacturerId and ensure they exist.",
      });
    }

    // 4) Fallback: generic 500 with best available context
    console.error("❌ Failed to create product:", sw || message);
    return res.status(500).json({
      success: false,
      error: "Failed to create product",
      details: apiErrors || [{ detail: message }],
    });
  }
}
