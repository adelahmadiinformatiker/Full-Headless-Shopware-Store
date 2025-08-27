import React from "react";
import { Outlet } from "react-router-dom";
import { CartProvider } from "../context/CartContext";

export default function Authentication() {
  return (
    <CartProvider>
      <Outlet />
    </CartProvider>
  );
}
