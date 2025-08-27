// external-node-layer\club-manager-sync\services\orderService.js

import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ silent: true });

const SHOPWARE_API_BASE =
  process.env.SHOPWARE_ADMIN_API_URL || "http://shopware.local/api";
const SHOPWARE_ACCESS_KEY =
  process.env.SHOPWARE_ACCESS_KEY || "SWSCY2J2REQ1TFVAQ3EYAUGYQG";

export async function placeOrder(contextToken, orderPayload) {
  console.log(
    "[orderService] 3.1 placeOrder: contextToken used:",
    contextToken
  );
  console.log("[orderService] 3.2 placeOrder: orderPayload:", orderPayload);

  const url = `${SHOPWARE_API_BASE}/store-api/checkout/order`;
  const headers = {
    "sw-access-key": SHOPWARE_ACCESS_KEY,
    "sw-context-token": contextToken,
    "Content-Type": "application/json",
  };
  console.log("[orderService] 3.3 placeOrder headers:", headers);
  console.log("[orderService] 3.4 placeOrder payload:", orderPayload);
  try {
    const response = await axios.post(url, orderPayload, { headers });
    console.log("[orderService] 3.5 placeOrder response:", response.data);
    return response.data;
  } catch (err) {
    console.error(
      "[orderService] placeOrder error:",
      err.response?.data || err.message
    );
    throw err;
  }
}

export async function getOrderById(orderId) {
  const url = `${SHOPWARE_API_BASE}/store-api/order/${orderId}`;
  const headers = {
    "sw-access-key": SHOPWARE_ACCESS_KEY,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (err) {
    console.error(
      "[orderService] getOrderById error:",
      err.response?.data || err.message
    );
    throw err;
  }
}
