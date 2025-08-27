import React from "react";
import { useCart } from "../../../context/CartContext";
import {
  addProductToCart,
  removeItemFromCart,
} from "../../../services/cartService";
import "../../../css/components/_cart-controls.css";
import { Link } from "react-router-dom";

export default function HeaderCart() {
  // دریافت داده‌های سبد خرید از کانتکست مرکزی CartContext
  const { cartItems, totalQuantity, refreshCart } = useCart();

  // محاسبه مجموع قیمت کل سبد خرید با توجه به totalPrice هر آیتم
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price?.totalPrice || 0),
    0
  );

  const isEmpty = cartItems.length === 0;

  // افزایش تعداد یک محصول در سبد خرید
  // ارتباط با Shopware از طریق تابع addProductToCart
  const handleIncrement = async (item) => {
    try {
      await addProductToCart(item.referencedId, 1); // افزودن یک عدد از همین محصول
      await refreshCart(); // به‌روزرسانی سبد خرید از سرور پس از تغییر
    } catch (err) {
      console.error("[CartUI] Increment failed:", err.message);
    }
  };

  // کاهش تعداد یک محصول از سبد خرید
  // اگر مقدار به ۰ برسد، آیتم به‌کلی حذف می‌شود
  const handleDecrement = async (item) => {
    try {
      if (item.quantity > 1) {
        await removeItemFromCart(item.id); // حذف آیتم فعلی
        await addProductToCart(item.referencedId, item.quantity - 1); // افزودن با تعداد جدید
      } else {
        await removeItemFromCart(item.id); // حذف کامل اگر فقط یک عدد باقی‌مانده
      }
      await refreshCart(); // به‌روزرسانی سبد خرید از سرور
    } catch (err) {}
  };

  return (
    <div className="dropdown">
      <a
        className="dropdown-toggle"
        data-toggle="dropdown"
        aria-expanded="true"
      >
        <i className="fa fa-shopping-cart"></i>
        <span>Your Cart</span>
        <div className="qty">{totalQuantity}</div>
      </a>
      <div className="cart-dropdown" onClick={(e) => e.stopPropagation()}>
        {isEmpty ? (
          <div
            className="cart-empty-message"
            style={{ padding: "32px 0", textAlign: "center", color: "#888" }}
          >
            <i
              className="fa fa-shopping-cart"
              style={{ fontSize: 32, marginBottom: 8, color: "#bbb" }}
            ></i>
            <div style={{ fontWeight: 500, fontSize: 16, marginTop: 8 }}>
              Your cart is empty
            </div>
            <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>
              Add products to see them here
            </div>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cartItems.map((item) => (
                <div className="product-widget" key={item.id}>
                  <div className="product-img">
                    {item.cover?.url ? (
                      <img src={item.cover.url} alt={item.label} />
                    ) : (
                      <div
                        style={{ width: 60, height: 60, background: "#eee" }}
                      ></div>
                    )}
                  </div>
                  <div className="product-body">
                    <h3 className="product-name">
                      <a href="#">{item.label}</a>
                    </h3>
                    <h4
                      className="product-price"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          disabled={item.quantity <= 1}
                          title="Decrease"
                          onClick={() => handleDecrement(item)}
                        >
                          –
                        </button>
                        <span className="qty">{item.quantity}x</span>
                        <button
                          className="qty-btn"
                          title="Increase"
                          onClick={() => handleIncrement(item)}
                        >
                          +
                        </button>
                      </div>
                      {item.price?.unitPrice?.toFixed(2)} €
                    </h4>
                  </div>{" "}
                  <button
                    className="delete"
                    onClick={async () => {
                      await removeItemFromCart(item.id);
                      await refreshCart();
                    }}
                  >
                    <i className="fa fa-close"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <small>{totalQuantity} Item(s) selected</small>
              <h5>SUBTOTAL: €{subtotal.toFixed(2)}</h5>
            </div>
            <div className="cart-btns">
              <Link to="#">View Cart</Link>
              <Link to="/checkout">
                Checkout <i className="fa fa-arrow-circle-right"></i>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
