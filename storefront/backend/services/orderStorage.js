// external-node-layer/club-manager-sync/services/orderStorage.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const DB_FILE = path.join(dataDir, "orders.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, "[]", "utf-8");
}

export function saveOrder(order) {
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const orders = JSON.parse(raw);

  const alreadyExists = orders.some((o) => o.orderId === order.orderId);
  if (alreadyExists) {
    console.log("[⚠️ orderStorage] Duplicate order ignored:", order.orderId);
    return;
  }

  orders.push(order);
  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), "utf-8");
  console.log("[💾 orderStorage] Order saved:", order.orderId);
}

export function getOrderByNumber(orderNumber) {
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const orders = JSON.parse(raw);
  return orders.find((o) => o.orderNumber === orderNumber);
}
