// backend/src/lib/taxResolver.js

import axios from "axios";
import { getValidAccessToken } from "../services/product.service.js";

// ---- Config knobs (via ENV) ----
const SHOPWARE_ADMIN_API_URL = process.env.SHOPWARE_API_BASE;
const TAX_ENV_ID = process.env.SHOPWARE_TAX_ID || "";
const TAX_PREFERRED_NAME = process.env.SHOPWARE_TAX_NAME || "Standard rate";
const TAX_FALLBACK_RATES = (process.env.SHOPWARE_TAX_RATES || "19,7")
  .split(",")
  .map((x) => Number(x.trim()))
  .filter((x) => !Number.isNaN(x));

let _taxCacheId = null; // in-memory cache per process

async function validateTaxId(id, token) {
  try {
    const r = await axios.get(`${SHOPWARE_ADMIN_API_URL}/tax/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return !!r.data?.data?.id;
  } catch {
    return false;
  }
}

async function searchTaxIdByName(name, token) {
  const r = await axios.post(
    `${SHOPWARE_ADMIN_API_URL}/search/tax`,
    { filter: [{ type: "equals", field: "name", value: name }], limit: 1 },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return r.data?.data?.[0]?.id || null;
}

async function searchTaxIdByRate(rate, token) {
  const r = await axios.post(
    `${SHOPWARE_ADMIN_API_URL}/search/tax`,
    { filter: [{ type: "equals", field: "taxRate", value: rate }], limit: 1 },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return r.data?.data?.[0]?.id || null;
}

async function pickAnyTaxId(token) {
  const r = await axios.post(
    `${SHOPWARE_ADMIN_API_URL}/search/tax`,
    { limit: 50, sort: [{ field: "taxRate", order: "DESC" }] },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return r.data?.data?.[0]?.id || null;
}

/**
 * Resolve a valid Shopware taxId using multiple strategies:
 * 1) caller-provided id (validated)
 * 2) env-provided id (validated)
 * 3) by configured name
 * 4) by common rates (e.g., 19, 7)
 * 5) any existing tax (highest rate first)
 * Result is cached in-memory.
 */
export async function resolveTaxId(taxId) {
  if (_taxCacheId) return _taxCacheId;

  const { access_token } = await getValidAccessToken();

  if (taxId && (await validateTaxId(taxId, access_token))) {
    _taxCacheId = taxId;
    return _taxCacheId;
  }
  if (TAX_ENV_ID && (await validateTaxId(TAX_ENV_ID, access_token))) {
    _taxCacheId = TAX_ENV_ID;
    return _taxCacheId;
  }
  const byName = await searchTaxIdByName(TAX_PREFERRED_NAME, access_token);
  if (byName) {
    _taxCacheId = byName;
    return _taxCacheId;
  }
  for (const rate of TAX_FALLBACK_RATES) {
    const byRate = await searchTaxIdByRate(rate, access_token);
    if (byRate) {
      _taxCacheId = byRate;
      return _taxCacheId;
    }
  }
  const any = await pickAnyTaxId(access_token);
  if (any) {
    _taxCacheId = any;
    return _taxCacheId;
  }

  throw new Error("No taxId provided and no tax entity could be resolved");
}
