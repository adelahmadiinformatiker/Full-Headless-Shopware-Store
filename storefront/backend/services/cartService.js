// backend/services/cartService.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ silent: true });

// Resolve Store API base and access key
const SHOPWARE_API_BASE =
  process.env.STORE_API_BASE || `${process.env.SHOPWARE_API_BASE}/store-api`;
const SHOPWARE_ACCESS_KEY =
  process.env.SALES_CHANNEL_ACCESS_KEY || process.env.SHOPWARE_ACCESS_KEY;

if (!SHOPWARE_API_BASE) {
  throw new Error("[cartService] STORE_API_BASE/SHOPWARE_API_BASE is missing");
}
if (!SHOPWARE_ACCESS_KEY) {
  throw new Error(
    "[cartService] SALES_CHANNEL_ACCESS_KEY/SHOPWARE_ACCESS_KEY is missing"
  );
}

// Build headers for Shopware Store API
function buildHeaders(contextToken) {
  const h = {
    "sw-access-key": SHOPWARE_ACCESS_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (contextToken) h["sw-context-token"] = contextToken;
  return h;
}

// Centralized axios call with better error surface
async function callShopware(method, url, { headers, data } = {}) {
  try {
    const res = await axios({
      method,
      url,
      headers,
      data,
      validateStatus: () => true,
    });
    if (res.status >= 200 && res.status < 300) return res;
    const errPayload =
      typeof res.data === "object" ? res.data : { message: String(res.data) };
    const error = new Error(
      `[Shopware] ${method.toUpperCase()} ${url} -> ${res.status}`
    );
    error.status = res.status;
    error.data = errPayload;
    throw error;
  } catch (e) {
    // Axios/network or server error
    if (e.response) {
      const error = new Error(
        `[Shopware] ${method.toUpperCase()} ${url} -> ${e.response.status}`
      );
      error.status = e.response.status;
      error.data = e.response.data;
      throw error;
    }
    throw e;
  }
}

// === Public API ===

// Add a product line item to cart
export async function addItemToCart(contextToken, productId, quantity = 1) {
  const url = `${SHOPWARE_API_BASE}/checkout/cart/line-item`;
  const payload = {
    items: [
      {
        type: "product",
        referencedId: productId,
        quantity: Number(quantity) || 1,
      },
    ],
  };
  const res = await callShopware("post", url, {
    headers: buildHeaders(contextToken),
    data: payload,
  });
  return res.data; // Shopware returns the updated cart
}

// Remove a line item from cart (Shopware standard delete endpoint)
export async function removeItemFromCart(contextToken, lineItemId) {
  const url = `${SHOPWARE_API_BASE}/checkout/cart/line-item/delete`;
  const payload = { ids: [lineItemId] };
  const res = await callShopware("post", url, {
    headers: buildHeaders(contextToken),
    data: payload,
  });
  return res.data; // Updated cart
}

// Get current cart
export async function getCart(contextToken) {
  const url = `${SHOPWARE_API_BASE}/checkout/cart`;
  const res = await callShopware("get", url, {
    headers: buildHeaders(contextToken),
  });
  return res.data; // Cart object
}
