import { loginUserViaShopware } from "./authService.js";
import { addItemToCart, getCart } from "./cartService.js";
import { placeOrder } from "./orderService.js";

const email = "test@example.com";
const password = "12345678";
const productId = "7bca22753c84d08b6178a50052b4146";

async function testFullOrderFlow() {
  try {
    console.log("🔐 Logging in...");
    const { user, contextToken } = await loginUserViaShopware(email, password);
    console.log("✅ Logged in as:", user?.email);
    console.log("🪪 contextToken:", contextToken);

    console.log("➕ Adding item to cart...");
    await addItemToCart(contextToken, productId, 1);

    console.log("🛒 Fetching cart...");
    const cart = await getCart(contextToken);
    console.log("🧾 Cart:", JSON.stringify(cart, null, 2));

    if (!cart.lineItems || cart.lineItems.length === 0) {
      console.error("❌ Cart is still empty. Aborting order.");
      return;
    }

    console.log("📦 Placing order...");
    const order = await placeOrder(contextToken, {});
    console.log("✅ Order placed successfully:", order);
  } catch (err) {
    console.error(
      "🔥 Error during full order flow:",
      err?.response?.data || err.message
    );
  }
}

testFullOrderFlow();
