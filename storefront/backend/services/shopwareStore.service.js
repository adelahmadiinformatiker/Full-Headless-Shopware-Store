// backend/services/shopwareStore.service.js
import axios from "axios";

const API_BASE =
  process.env.STORE_API_BASE || `${process.env.SHOPWARE_API_BASE}/store-api`;
const ACCESS_KEY =
  process.env.SALES_CHANNEL_ACCESS_KEY || process.env.SHOPWARE_ACCESS_KEY;

function headers(contextToken) {
  const h = { "sw-access-key": ACCESS_KEY, "Content-Type": "application/json" };
  if (contextToken) h["sw-context-token"] = contextToken;
  return h;
}

export async function fetchProducts(
  { page = 1, limit = 12, term } = {},
  contextToken
) {
  const body = {
    page,
    limit,
    sort: [{ field: "createdAt", order: "DESC" }],
  };

  if (term?.trim()) {
    body.term = term.trim();
  }

  const { data } = await axios.post(`${API_BASE}/product`, body, {
    headers: headers(contextToken),
  });

  return data;
}
