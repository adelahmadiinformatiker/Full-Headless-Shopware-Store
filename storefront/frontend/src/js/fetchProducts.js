// storefront\frontend\src\js\fetchProducts.js

const BASE = import.meta.env.VITE_API_BASE || "/api";
const API_URL = `${BASE}/products?limit=4`;
const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY;

const WITH_CREDENTIALS = !!(
  BASE.startsWith("http://") || BASE.startsWith("https://")
);

/**
 * Fetches active products from backend proxy → Shopware Store API.
 * Returns a normalized array of products.
 */
export async function fetchProducts() {
  try {
    const headers = { Accept: "application/json" };
    if (ACCESS_KEY) headers["sw-access-key"] = ACCESS_KEY;

    const res = await fetch(API_URL, {
      method: "GET",
      headers,
      credentials: WITH_CREDENTIALS ? "include" : "same-origin",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `GET ${API_URL} failed: ${res.status} ${res.statusText} ${text}`
      );
    }

    const body = await res.json().catch(() => ({}));

    // Normalize: support array or common wrappers
    let items = [];

    if (Array.isArray(body)) {
      items = body;
    } else if (Array.isArray(body.elements)) {
      items = body.elements;
    } else if (Array.isArray(body.data)) {
      items = body.data;
    } else if (Array.isArray(body.products)) {
      items = body.products;
    } else if (Array.isArray(body.result)) {
      items = body.result;
    }

    console.debug("[fetchProducts] count:", items.length, "sample:", items[0]);
    return items;
  } catch (err) {
    console.error("❌ Error loading products:", err);
    return [];
  }
}
