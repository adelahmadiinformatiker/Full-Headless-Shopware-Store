// services/product.service.ts

import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ENABLE_SERVER_LOGS = process.env.ENABLE_SERVER_LOGS === "true";
const SHOPWARE_ADMIN_API_URL = process.env.SHOPWARE_API_BASE;

// Get all products from Shopware
async function listProducts() {
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

// =====================
// Shopware Access Token Management
// =====================

let cachedToken = null; // Cache for the current access token
let tokenExpiresAt = 0; // Timestamp when the token expires

// Get valid access token from Shopware or return the cached token
export async function getValidAccessToken() {
  // Umgebungsvariablen für Client-ID und Secret
  const clientId = process.env.SHOPWARE_CLIENT_ID;
  const clientSecret = process.env.SHOPWARE_CLIENT_SECRET;
  const apiUrl = process.env.SHOPWARE_ADMIN_API_URL;

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
    const res = await axios.post(`${apiUrl}/oauth/token`, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
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

// Export all functions
export {
  // createProduct,
  // getProductById,
  // updateProduct,
  // deleteProduct,
  listProducts,
};
