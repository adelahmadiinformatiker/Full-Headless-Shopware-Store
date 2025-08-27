import { loginUser } from "../services/authService";
import { addProductToCart, getCart } from "../services/cartService";
import { placeOrder } from "../services/orderService";

/**
 * Test the full order flow after login using Shopware Store API.
 * @param {string} email - User email for login
 * @param {string} password - User password for login
 * @param {Array<{productId: string, quantity: number}>} items - Products to add to cart
 * @param {object} orderPayload - Payload for placing the order
 */
export async function testOrderFlow({ email, password, items, orderPayload }) {
  try {
    // 1. Login and get contextToken
    const { user, contextToken } = await loginUser(email, password);
    localStorage.setItem("contextToken", contextToken);
    // 2. Add items to cart with new contextToken
    for (const { productId, quantity } of items) {
      await addProductToCart(contextToken, productId, quantity);
    }
    // 3. Fetch and log cart
    const cart = await getCart(contextToken);
    return orderResult;
  } catch (err) {
    console.error("[OrderTest] Error in testOrderFlow:", err);
    throw err;
  }
}

// Example usage (uncomment and fill in real data to test):
// testOrderFlow({
//   email: 'user@example.com',
//   password: 'password123',
//   items: [
//     { productId: 'PRODUCT_ID_1', quantity: 1 },
//     { productId: 'PRODUCT_ID_2', quantity: 2 },
//   ],
//   orderPayload: {
//     // Fill with required order fields, e.g. billingAddress, shippingAddress, paymentMethodId
//   },
// });
