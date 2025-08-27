// management/backend/utils/manufacturer.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const SHOPWARE_ADMIN_API_URL = process.env.SHOPWARE_API_BASE;

/** @returns {Promise<any>} */
export async function getManufacturerById(manufacturerId, token) {
  if (!manufacturerId) return null;
  if (!token) throw new Error("getManufacturerById: missing access token");
  const r = await axios.get(
    `${SHOPWARE_ADMIN_API_URL}/product-manufacturer/${manufacturerId}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    }
  );
  return r.data?.data || null;
}

/** @returns {Promise<string>} */
export async function createManufacturer(name, token) {
  if (!token) throw new Error("createManufacturer: missing access token");
  const r = await axios.post(
    `${SHOPWARE_ADMIN_API_URL}/product-manufacturer?_response=detail`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  const id = r.data?.data?.id;
  if (!id) throw new Error("Manufacturer creation failed");
  return id;
}
