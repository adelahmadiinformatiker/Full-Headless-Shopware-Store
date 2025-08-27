// storefront\frontend\src\services\cartService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE || "/api";
const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY;

/**
 * Retrieves the existing cart context token from localStorage,
 * or creates a new cart and returns its context token.
 * @returns {Promise<string>} The cart context token
 */
export async function getOrCreateCartToken() {
  let CONTEXT_TOKEN = localStorage.getItem("contextToken");

  if (CONTEXT_TOKEN) {
    return CONTEXT_TOKEN;
  }

  console.log("[cartService] No CONTEXT_TOKEN found, creating new cart...");

  const response = await fetch(`${API_BASE_URL}/checkout/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "sw-access-key": ACCESS_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "[cartService] Failed to create cart:",
      response.status,
      errorText
    );
    throw new Error("Failed to create cart");
  }

  const token = response.headers.get("sw-context-token");

  if (token) {
    localStorage.setItem("contextToken", token);
    return token;
  }

  throw new Error("CONTEXT_TOKEN could not be extracted from response");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function addProductToCart(productId, quantity = 1) {
  if (!productId) {
    console.error("[cartService] ❌ Invalid productId in addProductToCart");
    throw new Error("Invalid productId");
  }

  const token = await getOrCreateCartToken();
  localStorage.setItem("contextToken", token);

  const uniqueLineItemId = `line-item-${Date.now()}`;

  const response = await fetch(`${API_BASE_URL}/checkout/cart/line-item`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "sw-context-token": token,
      "sw-access-key": ACCESS_KEY,
    },
    body: JSON.stringify({
      items: [
        {
          id: uniqueLineItemId,
          referencedId: productId,
          type: "product",
          quantity: Number(quantity) || 1,
        },
      ],
    }),
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text(); // read body only on error
    console.error("[cartService] Add failed:", response.status, errorText);
    throw new Error("Failed to add item to cart");
  }

  console.log("[cartService] ✅ Product added to cart successfully");
  window.dispatchEvent(new Event("forceRefreshCart"));
}

export async function getCartItems() {
  const CONTEXT_TOKEN = await getOrCreateCartToken();

  const response = await fetch(`${API_BASE_URL}/checkout/cart`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "sw-context-token": CONTEXT_TOKEN,
      "sw-access-key": ACCESS_KEY,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "[cartService] Fetch cart failed:",
      response.status,
      errorText
    );
    throw new Error("Failed to fetch cart");
  }

  // Only set token if none exists (avoid churn)
  const newToken = response.headers.get("sw-context-token");
  if (newToken && !localStorage.getItem("contextToken")) {
    localStorage.setItem("contextToken", newToken);
  } else {
    console.log(
      "[cartService/getCartItems] Using existing context token:",
      CONTEXT_TOKEN
    );
  }

  const data = await response.json();

  // helpful diagnostics
  const count = Array.isArray(data?.lineItems)
    ? data.lineItems.length
    : Object.values(data?.lineItems || {}).length;
  console.log(
    "[cartService] Cart items fetched successfully (count:",
    count,
    ")"
  );

  return data;
}

export async function removeItemFromCart(lineItemId) {
  const CONTEXT_TOKEN = await getOrCreateCartToken();
  const payload = {
    ids: [lineItemId],
  };

  console.log("[cartService] Removing item from cart:", lineItemId);
  const response = await fetch(
    `${API_BASE_URL}/checkout/cart/line-item/delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "sw-context-token": CONTEXT_TOKEN,
        "sw-access-key": ACCESS_KEY,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error?.errors?.[0]?.detail || "Failed to remove item from cart"
    );
  }
}

export async function updateCartItemQuantity(referencedId, newQuantity) {
  const CONTEXT_TOKEN = await getOrCreateCartToken();
  const payload = {
    items: [
      {
        id: referencedId,
        type: "product",
        quantity: Number(newQuantity),
      },
    ],
  };

  console.log(
    "[cartService/updateCartItemQuantity] Updating item quantity:",
    referencedId,
    "(new qty: " + newQuantity + ")"
  );
  const response = await fetch(`${API_BASE_URL}/checkout/cart/line-item`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "sw-context-token": CONTEXT_TOKEN,
      "sw-access-key": ACCESS_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error?.errors?.[0]?.detail || "Failed to update cart item quantity"
    );
  }

  const data = await response.json();
  return data;
}

/**
 * Clears the Shopware cart.
 *
 */
export async function clearShopwareCart() {
  const CONTEXT_TOKEN = localStorage.getItem("contextToken");
  const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY;

  console.log("[cartService] Clearing Shopware cart...");
  if (!CONTEXT_TOKEN) throw new Error("No CONTEXT_TOKEN found in localStorage");
  if (!ACCESS_KEY)
    throw new Error("No ACCESS_KEY found in environment variables");

  const response = await fetch(`${API_BASE_URL}/checkout/cart`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "sw-context-token": CONTEXT_TOKEN,
      "sw-access-key": ACCESS_KEY,
    },

    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.errors?.[0]?.detail || "Failed to clear cart");
  }

  localStorage.removeItem("guestCart");
  localStorage.removeItem("contextToken");

  const newToken = await getOrCreateCartToken();
  console.log("[cartService] ✅ New context token:", newToken);

  await getCartItems();

  window.dispatchEvent(new Event("forceRefreshCart"));

  console.log("[cartService] ✅ Shopware cart cleared.");
}
