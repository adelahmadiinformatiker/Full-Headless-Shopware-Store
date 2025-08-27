// management/backend/utils/productMedia.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const SHOPWARE_ADMIN_API_URL = process.env.SHOPWARE_API_BASE;
const ENABLE_SERVER_LOGS = process.env.ENABLE_SERVER_LOGS === "true";

export async function syncProductMedia(
  productId,
  access_token,
  media = [],
  coverImage = null
) {
  if (!productId || !Array.isArray(media) || media.length === 0) {
    return { success: true, linked: 0, skipped: 0, errors: [] };
  }
  if (!access_token)
    throw new Error("access_token is required for syncProductMedia");

  const headers = {
    Authorization: `Bearer ${access_token}`,
    "Content-Type": "application/json",
  };

  let linked = 0,
    skipped = 0;
  const errors = [];

  for (let i = 0; i < media.length; i++) {
    const item = media[i];
    const mediaId = item?.mediaId;
    if (!mediaId || (coverImage && mediaId === coverImage)) {
      skipped++;
      continue;
    }

    try {
      await axios.post(
        `${SHOPWARE_ADMIN_API_URL}/product-media`,
        { productId, mediaId, position: item.position || i + 1 },
        { headers }
      );
      linked++;
      if (ENABLE_SERVER_LOGS)
        console.log(`🖼️ Linked media to product ${productId}: ${mediaId}`);
    } catch (err) {
      const detail = err?.response?.data || err.message;
      errors.push({ mediaId, error: detail });
      if (ENABLE_SERVER_LOGS)
        console.warn(`⚠️ Failed linking media ${mediaId} →`, detail);
    }
  }

  return { success: errors.length === 0, linked, skipped, errors };
}
