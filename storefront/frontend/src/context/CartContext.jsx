import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCartItems,
  addProductToCart,
  removeItemFromCart,
  updateCartItemQuantity,
} from "../services/cartService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const refreshCart = async () => {
    try {
      const cart = await getCartItems();
      const fallback = JSON.parse(localStorage.getItem("guestCart") || "[]");

      // Normalize lineItems into an array (Shopware may return an object)
      let itemsArray = [];
      if (cart?.lineItems) {
        itemsArray = Array.isArray(cart.lineItems)
          ? cart.lineItems
          : Object.values(cart.lineItems);
      }

      const effective = itemsArray.length ? itemsArray : fallback;
      setCartItems(effective);

      const total = effective.reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      );
      setTotalQuantity(total);

      localStorage.setItem("guestCart", JSON.stringify(effective));
      console.log("[CartContext] Refreshed cart:", effective);
    } catch (e) {
      console.error("[CartContext] Failed to refresh cart:", e);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    try {
      await addProductToCart(productId, quantity);
      await refreshCart();
    } catch (e) {
      console.error("[CartContext] Add failed:", e);
      throw e;
    }
  };

  const removeItem = async (id) => {
    try {
      await removeItemFromCart(id);
      await refreshCart();
    } catch (e) {
      console.error("[CartContext] Remove failed:", e);
      throw e;
    }
  };

  const updateItemQuantity = async (id, qty) => {
    try {
      await updateCartItemQuantity(id, qty);
      await refreshCart();
    } catch (e) {
      console.error("[CartContext] Update qty failed:", e);
      throw e;
    }
  };

  const clearGuestCart = () => {
    localStorage.removeItem("guestCart");
  };

  useEffect(() => {
    refreshCart();
  }, []);

  useEffect(() => {
    const handleRefresh = () => refreshCart();
    window.addEventListener("forceRefreshCart", handleRefresh);
    return () => window.removeEventListener("forceRefreshCart", handleRefresh);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalQuantity,
        addItem,
        removeItem,
        updateItemQuantity,
        refreshCart,
        clearGuestCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
