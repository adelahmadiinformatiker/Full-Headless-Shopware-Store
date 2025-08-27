import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ENABLE_SERVER_LOGS = process.env.ENABLE_SERVER_LOGS === "true";
const SHOPWARE_ADMIN_API_URL = process.env.SHOPWARE_API_BASE;
const SHOPWARE_CLIENT_ID = process.env.SHOPWARE_CLIENT_ID;
const SHOPWARE_CLIENT_SECRET = process.env.SHOPWARE_CLIENT_SECRET;

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
        "Neues Access Token geholt. Gültig bis:",
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
        "Fehler beim Holen des Access Tokens:",
        err.response?.data || err.message
      );
    }
    throw err;
  }
}
