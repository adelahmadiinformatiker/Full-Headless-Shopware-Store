// storefront\frontend\src\services\orderService.js

export async function submitOrder({
  billingInfo,
  shippingInfo,
  paymentMethodId,
}) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE || "/api";

  const ACCESS_KEY =
    import.meta.env.VITE_ACCESS_KEY || "SWSCY2J2REQ1TFVAQ3EYAUGYQG";

  const contextToken = localStorage.getItem("contextToken");

  if (!contextToken) {
    console.error(" [OrederService] [submitOrder] Missing contextToken.");
    throw new Error("No contextToken found. Cannot submit order.");
  } else {
    console.log(
      "[OrederService] [submitOrder] Using contextToken:",
      contextToken
    );
  }

  const cartCheckRes = await fetch(`${API_BASE_URL}/checkout/cart`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "sw-context-token": contextToken,
      "sw-access-key": ACCESS_KEY,
    },
  });

  const cartData = await cartCheckRes.json();

  if (!cartData?.lineItems?.length) {
    console.error(" [OrederService] Cart is empty:", cartData);
    throw new Error("Cart is empty. Cannot place order.");
  } else {
    console.log("[OrederService] Cart items:", cartData.lineItems);
  }

  const payload = {
    billingAddress: billingInfo,
    ...(shippingInfo?.enabled && { shippingAddress: shippingInfo }),
    paymentMethodId,
  };

  const headers = {
    "Content-Type": "application/json",
    "sw-context-token": contextToken,
    "sw-access-key": ACCESS_KEY,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/checkout/order`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[orderService] Order submission failed:", error);
      throw new Error(error?.errors?.[0]?.detail || "Order submission failed.");
    } else {
      console.log("[orderService] Order submission successful");
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("[orderService] Order submission error:", err);
    throw err;
  }
}
