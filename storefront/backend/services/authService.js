// external-node-layer/club-manager-sync/services/authService.js

import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ silent: true });

const SHOPWARE_API_BASE =
  process.env.SHOPWARE_API_BASE || "http://shopware.local";
const SHOPWARE_ACCESS_KEY =
  process.env.SHOPWARE_ACCESS_KEY || "SWSCY2J2REQ1TFVAQ3EYAUGYQG";

// console.log("[authService] SHOPWARE_API_BASE:", SHOPWARE_API_BASE);
// console.log("[authService] SHOPWARE_ACCESS_KEY:", SHOPWARE_ACCESS_KEY);

export const registerUserAndSync = async ({ email, password }) => {
  try {
    // console.log("[authService] Registering user:", email);
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    // Fetch salutationId
    const salutationRes = await axios.get(
      `${SHOPWARE_API_BASE}/store-api/salutation`,
      {
        headers: {
          "sw-access-key": SHOPWARE_ACCESS_KEY,
        },
      }
    );
    const salutationId = salutationRes.data?.elements?.[0]?.id;
    // console.log("[authService] salutationId:", salutationId);
    if (!salutationId) throw new Error("No valid salutationId found");

    // Fetch countryId
    const countryRes = await axios.get(
      `${SHOPWARE_API_BASE}/store-api/country`,
      {
        headers: {
          "sw-access-key": SHOPWARE_ACCESS_KEY,
        },
      }
    );
    const countryId = countryRes.data?.elements?.[0]?.id;
    // console.log("[authService] countryId:", countryId);
    if (!countryId) throw new Error("No valid countryId found");

    // Registration payload with billingAddress
    const registerPayload = {
      email,
      password,
      salutationId,
      storefrontUrl: SHOPWARE_API_BASE,
      billingAddress: {
        firstName: "Ali",
        lastName: "Ahmadi",
        street: "Teststr. 1",
        city: "Tehran",
        zipcode: "12345",
        countryId,
      },
    };
    const registerHeaders = { "sw-access-key": SHOPWARE_ACCESS_KEY };
    // console.log(
    //   "[authService] Registering at:",
    //   `${SHOPWARE_API_BASE}/store-api/account/register`
    // );
    // console.log("[authService] Payload:", registerPayload);
    // console.log("[authService] Headers:", registerHeaders);

    const shopwareResponse = await axios.post(
      `${SHOPWARE_API_BASE}/store-api/account/register`,
      registerPayload,
      { headers: registerHeaders }
    );

    return { user: { email }, shopware: shopwareResponse.data };
  } catch (err) {
    console.error("[authService] Registration sync error (full):", err);
    console.error(
      "[authService] Registration sync error (response):",
      err?.response?.data || err.message
    );
    const shopwareError = err?.response?.data?.errors?.[0]?.detail;
    throw new Error("Registration failed: " + (shopwareError || err.message));
  }
};

export const loginUserViaShopware = async (email, password) => {
  // 1. Send login request to Shopware
  const loginUrl = `${SHOPWARE_API_BASE}/store-api/account/login`;
  const loginResponse = await axios.post(
    loginUrl,
    { email, password },
    {
      headers: {
        "sw-access-key": SHOPWARE_ACCESS_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  // 2. Get contextToken from header
  const contextToken = loginResponse.headers["sw-context-token"];
  if (!contextToken) {
    throw new Error("contextToken not returned from Shopware");
  }
  // 3. Get user info from Shopware
  const customerResponse = await axios.get(
    `${SHOPWARE_API_BASE}/store-api/account/customer`,
    {
      headers: {
        "sw-access-key": SHOPWARE_ACCESS_KEY,
        "sw-context-token": contextToken,
      },
    }
  );
  const user = customerResponse.data;
  return { user, contextToken };
};
