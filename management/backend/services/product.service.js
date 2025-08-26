// management\backend\services\product.service.js

import axios from "axios";
import dotenv from "dotenv";
import { resolveTaxId } from "../utils/taxResolver.js";

dotenv.config();

const ENABLE_SERVER_LOGS = process.env.ENABLE_SERVER_LOGS === "true";
const SHOPWARE_ADMIN_API_URL = process.env.SHOPWARE_API_BASE;
const SHOPWARE_CLIENT_ID = process.env.SHOPWARE_CLIENT_ID;
const SHOPWARE_CLIENT_SECRET = process.env.SHOPWARE_CLIENT_SECRET;

// Export all functions
export {
  createProduct,
  // getProductById,
  // updateProduct,
  // deleteProduct,
  listProducts,
};

// ************* Get all products from Shopware *************
async function listProducts() {
  console.info("###\tproduct.service.js/listProducts()\n");

  try {
    const { access_token } = await getValidAccessToken();
    const response = await axios.get(
      `${SHOPWARE_ADMIN_API_URL}/product`, // keine Limitierung
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(
      "Fehler beim Listen der Produkte:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// *************     Product creation block     *************
// << Begin of Product creation block

function normalizePrice(price) {
  // If already in Shopware array format, return as-is
  if (
    Array.isArray(price) &&
    typeof price[0]?.gross === "number" &&
    typeof price[0]?.net === "number"
  ) {
    return price;
  }

  // Accept numeric or [numeric]; mirror gross=net for simplicity
  const numeric = Array.isArray(price) ? price[0] : price;
  if (typeof numeric !== "number")
    throw new Error("price must be a number or a Shopware price array");

  return [
    {
      // Default EUR currency id in a fresh SW install; replace if yours differs
      currencyId: "b7d2554b0ce847cd82f3ac9bd1c0dfca",
      gross: numeric,
      net: numeric,
      linked: true,
    },
  ];
}

async function getManufacturerById(manufacturerId) {
  const { access_token } = await getValidAccessToken();
  try {
    const r = await axios.get(
      `${SHOPWARE_ADMIN_API_URL}/product-manufacturer/${manufacturerId}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );
    return r.data?.data || null;
  } catch (e) {
    if (e.response?.status === 404) return null;
    throw e;
  }
}

async function createManufacturer(name) {
  const { access_token } = await getValidAccessToken();
  const r = await axios.post(
    `${SHOPWARE_ADMIN_API_URL}/product-manufacturer?_response=detail`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  const id = r.data?.data?.id;
  if (!id) throw new Error("Manufacturer creation failed");
  return id;
}

// --- main ------------------------------------------------------------------

async function createProduct(payload) {
  // Defensive: accept a plain object and extract fields
  const {
    name,
    price,
    productNumber,
    taxId,
    stock,
    manufacturerId,
    description,
    highlight,
    active,
    coverImage, // mediaId (optional)
    // media = [], // reserved for later (gallery)
  } = payload || {};

  // Basic validations for required fields
  if (!name) throw new Error("name is required");
  if (!productNumber) throw new Error("productNumber is required");
  if (stock === undefined || stock === null)
    throw new Error("stock is required");
  if (price === undefined || price === null)
    throw new Error("price is required");

  // Resolve taxId (can auto-discover if not provided)
  const resolvedTaxId = await resolveTaxId(taxId);

  // Ensure manufacturer exists (create a default one if missing/invalid)
  let validManufacturerId = manufacturerId;
  if (!manufacturerId || !(await getManufacturerById(manufacturerId))) {
    validManufacturerId = await createManufacturer("Default Manufacturer");
  }

  // Prepare final payload
  const LIVE_VERSION_ID = "0fa91ce3e96a4bc2be4bd9ce752c3425";
  const body = {
    name,
    productNumber,
    stock: Number(stock),
    taxId: resolvedTaxId,
    taxVersionId: LIVE_VERSION_ID,
    manufacturerId: validManufacturerId,
    manufacturerVersionId: LIVE_VERSION_ID,
    description: description || undefined,
    highlight: !!highlight,
    active: active !== undefined ? !!active : true,
    price: normalizePrice(price),
    cover: coverImage ? { mediaId: coverImage } : undefined,
  };

  const { access_token } = await getValidAccessToken();

  try {
    const r = await axios.post(
      `${SHOPWARE_ADMIN_API_URL}/product?_response=detail`,
      body,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const productId = r?.data?.data?.id;
    if (!productId) {
      // If Shopware returned an error array, bubble it up for controller
      if (r.data?.errors) return { errors: r.data.errors };
      return null;
    }
    if (ENABLE_SERVER_LOGS) console.log("✅ Created product:", productId);
    return productId;
  } catch (err) {
    // Re-throw with API error context so controller can shape the response
    const apiErrors = err.response?.data?.errors;
    const message = apiErrors?.[0]?.detail || err.message;
    const error = new Error(message);
    error.response = err.response; // keep original response for the controller
    throw error;
  }
}

// End of Product creation block >>

// =====================
// Shopware Access Token Management
// =====================

let cachedToken = null; // Cache for the current access token
let tokenExpiresAt = 0; // Timestamp when the token expires

// Get valid access token from Shopware or return the cached token
export async function getValidAccessToken() {
  // Prüfen, ob ein gültiges Token im Speicher ist
  const now = Math.floor(Date.now() / 1000); // Sekunden seit 1970
  if (cachedToken && tokenExpiresAt - 10 > now) {
    // Noch gültig (10 Sekunden Sicherheitspuffer)
    return {
      access_token: cachedToken,
      expires_in: tokenExpiresAt - now,
    };
  }

  // Neues Token holen
  try {
    const res = await axios.post(`${SHOPWARE_ADMIN_API_URL}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: SHOPWARE_CLIENT_ID,
      client_secret: SHOPWARE_CLIENT_SECRET,
    });
    cachedToken = res.data.access_token;
    tokenExpiresAt = now + (res.data.expires_in || 600);
    if (ENABLE_SERVER_LOGS) {
      console.log(
        "[shopwareClient.js] Neues Access Token geholt. Gültig bis:",
        new Date(tokenExpiresAt * 1000).toISOString()
      );
    }
    return {
      access_token: cachedToken,
      expires_in: res.data.expires_in,
    };
  } catch (err) {
    if (ENABLE_SERVER_LOGS) {
      console.error(
        "[shopwareClient.js] Fehler beim Holen des Access Tokens:",
        err.response?.data || err.message
      );
    }
    throw err;
  }
}
