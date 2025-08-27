// management\backend\services\product.service.js

import axios from "axios";
import dotenv from "dotenv";

import { normalizePrice } from "../utils/normalizePrice.js";
import { resolveTaxId } from "../utils/taxResolver.js";
import {
  getManufacturerById,
  createManufacturer,
} from "../utils/manufacturer.js";
import { getValidAccessToken } from "../utils/validAccessToken.js";
import { syncProductMedia } from "../utils/productMedia.js";
dotenv.config();

const ENABLE_SERVER_LOGS = process.env.ENABLE_SERVER_LOGS === "true";
const SHOPWARE_ADMIN_API_URL = process.env.SHOPWARE_API_BASE;

// Export all functions
export {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  listProducts,
};

// *************     Get all products     *************
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

// *************    Get a single product  *************
async function getProductById(id) {
  try {
    const { access_token } = await getValidAccessToken();

    const response = await axios.get(
      `${SHOPWARE_ADMIN_API_URL}/product/${id}?associations[media][]=&associations[cover][]`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );

    const product = response.data.data;
    const mediaIds = [];

    if (product.cover?.mediaId) mediaIds.push(product.cover.mediaId);
    if (Array.isArray(product.media)) {
      for (const m of product.media) {
        if (m.mediaId) mediaIds.push(m.mediaId);
      }
    }

    const mediaResponse = await axios.post(
      `${SHOPWARE_ADMIN_API_URL}/search/media`,
      {
        filter: [
          {
            type: "multi",
            operator: "OR",
            queries: [...new Set(mediaIds)].map((id) => ({
              type: "equals",
              field: "id",
              value: id,
            })),
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const mediaInfo = mediaResponse.data?.data || [];

    if (Array.isArray(product.media)) {
      product.media = product.media.map((m) => ({
        mediaId: m.mediaId,
        isCover: product.coverId === m.id,
        url: mediaInfo.find((mi) => mi.id === m.mediaId)?.url || null,
      }));
    }

    if (product.cover?.mediaId) {
      product.cover.url =
        mediaInfo.find((mi) => mi.id === product.cover.mediaId)?.url || null;
    }
    if (ENABLE_SERVER_LOGS) {
      console.log("📤 getProductById → mapped media:", product.media);
      console.log("📤 getProductById → cover:", product.cover);
    }

    return product;
  } catch (error) {
    console.error(
      "Fehler beim Abrufen des Produkts:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// *************     Product creation     *************
async function createProduct(payload) {
  if (ENABLE_SERVER_LOGS) console.log("📦 createProduct payload:", payload);

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
    coverImage,
    media = [],
  } = payload || {};

  if (!name) throw new Error("name is required");
  if (!productNumber) throw new Error("productNumber is required");
  if (stock === undefined || stock === null)
    throw new Error("stock is required");
  if (price === undefined || price === null)
    throw new Error("price is required");

  const { access_token } = await getValidAccessToken();

  const resolvedTaxId = await resolveTaxId(taxId, access_token);

  let validManufacturerId = manufacturerId;
  if (
    !manufacturerId ||
    !(await getManufacturerById(manufacturerId, access_token))
  ) {
    validManufacturerId = await createManufacturer(
      "Default Manufacturer",
      access_token
    );
  }

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
    if (r.data?.errors) return { errors: r.data.errors };
    return null;
  }

  let galleryResult = { success: true, linked: 0, skipped: 0, errors: [] };
  try {
    galleryResult = await syncProductMedia(
      productId,
      access_token,
      media,
      coverImage
    );
    if (ENABLE_SERVER_LOGS)
      console.log("🧩 gallery input:", { media, coverImage });
  } catch (e) {
    if (ENABLE_SERVER_LOGS) {
      console.warn(
        "⚠️ Gallery linking failed (non-fatal):",
        e?.response?.data || e.message
      );
    }
  }

  if (ENABLE_SERVER_LOGS) {
    console.log(
      "✅ Created product:",
      productId,
      " | 🖼️ gallery:",
      galleryResult
    );
  }

  return { success: true, id: productId, gallery: galleryResult };
}

// *************      Delete Product      *************
async function deleteProduct(id) {
  // Diese Funktion löscht ein Produkt anhand der ID über die Shopware Admin API.
  try {
    const { access_token } = await getValidAccessToken();
    const response = await axios.delete(
      `${SHOPWARE_ADMIN_API_URL}/product/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );
    // Rückgabe: true bei Erfolg
    if (response.status === 204) {
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    // Fehlerausgabe im Terminal
    console.error(
      "Fehler beim Löschen des Produkts:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// *************      Update Product      *************
async function updateProduct(
  id,
  {
    name,
    price,
    productNumber,
    taxId,
    stock,
    manufacturerId,
    description,
    highlight,
    active,
    media = [],
    coverImage,
  }
) {
  try {
    const { access_token } = await getValidAccessToken();

    const resolvedTaxId = await resolveTaxId(taxId, access_token);

    let validManufacturerId = manufacturerId;
    if (
      !manufacturerId ||
      !(await getManufacturerById(manufacturerId, access_token))
    ) {
      validManufacturerId = await createManufacturer(
        "Default Manufacturer",
        access_token
      );
    }

    const payload = {
      name,
      productNumber,
      stock: Number(stock),
      taxId: resolvedTaxId,
      manufacturerId: validManufacturerId,
      description: description || undefined,
      highlight: !!highlight,
      active: active !== false,
      price: normalizePrice(price),
    };

    if (coverImage === null) payload.cover = null;
    else if (coverImage) payload.cover = { mediaId: coverImage };

    const response = await axios.patch(
      `${SHOPWARE_ADMIN_API_URL}/product/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const galleryResult = await syncProductMedia(
      id,
      access_token,
      media,
      coverImage
    );
    if (ENABLE_SERVER_LOGS)
      console.log("🧩 gallery input:", { media, coverImage });

    return { success: true, data: response.data.data, gallery: galleryResult };
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren des Produkts:",
      error.response?.data || error.message
    );
    throw error;
  }
}
