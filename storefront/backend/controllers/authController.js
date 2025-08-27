// controllers/authController.js

import * as authService from "../services/authService.js";

export const register = async (req, res) => {
  const { email, password } = req.body;
  // console.log("[authController] Incoming register request:", req.body);
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  try {
    const result = await authService.registerUserAndSync({ email, password });
    // console.log("[authController] Registration result:", result);
    return res.status(201).json(result);
  } catch (err) {
    console.error("[authController] Registration error:", err);
    return res
      .status(500)
      .json({ message: "Registration failed.", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const { user, contextToken } = await authService.loginUserViaShopware(
      email,
      password
    );
    // Log contextToken and user email
    // console.log(
    //   "[DEBUG] Login endpoint: contextToken:",
    //   contextToken,
    //   "user.email:",
    //   user.email
    // );
    res.json({ user, contextToken });
  } catch (err) {
    console.error("[ERROR] Login endpoint:", err.message);
    res.status(401).json({ message: err.message || "Login failed" });
  }
};

export const shopwareLogin = async (req, res) => {
  res.status(501).json({ message: "Shopware login not implemented" });
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

  // --- Add this logging ---
  console.log(
    "[DEBUG] Shopware login: contextToken:",
    contextToken,
    "user.email:",
    user.email
  );

  return { user, contextToken };
};

// Example function for placing an order with Shopware
export const placeOrder = async (req, res) => {
  const contextToken = req.headers["sw-context-token"] || req.body.contextToken;
  const orderPayload = req.body.orderPayload || req.body;
  // Log contextToken received from frontend
  console.log(
    "[DEBUG] placeOrder endpoint: contextToken from frontend:",
    contextToken
  );
  // Prepare headers for Shopware
  const headers = {
    "sw-access-key": process.env.SHOPWARE_ACCESS_KEY,
    "sw-context-token": contextToken,
    "Content-Type": "application/json",
  };
  console.log(
    "[DEBUG] placeOrder endpoint: headers sent to Shopware:",
    headers
  );
  console.log(
    "[DEBUG] placeOrder endpoint: payload sent to Shopware:",
    orderPayload
  );
  try {
    const response = await axios.post(
      `${process.env.SHOPWARE_API_BASE}/store-api/checkout/order`,
      orderPayload,
      { headers }
    );
    console.log(
      "[DEBUG] placeOrder endpoint: Shopware response:",
      response.data
    );
    res.json(response.data);
  } catch (err) {
    console.error(
      "[ERROR] placeOrder endpoint: Shopware error:",
      err.response?.data || err.message
    );
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { message: err.message });
  }
};
