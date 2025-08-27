import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";

export default function Order({ setPaymentMethodId, handlePlaceOrder }) {
  const { cartItems } = useCart(); // 🛒 گرفتن آیتم‌های سبد خرید از context مرکزی

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price?.totalPrice || 0),
    0
  );

  // 📌 نگه‌داری نوع پرداخت انتخاب‌شده (bank, cash, paypal)
  const [selectedPayment, setSelectedPayment] = useState("");

  // ✅ وضعیت پذیرش شرایط و مقررات خرید توسط کاربر
  const [termsAccepted, setTermsAccepted] = useState(false);

  // 📥 نگاشت نوع پرداخت به شناسه‌ی معتبر پرداخت (در Shopware یا سیستم شما)
  const paymentMethodIdMap = {
    bank: "123456",
    cash:
      import.meta.env.PAYMENT_VALID_ID || "0197c5bdb0297393a1e43537ffde72ad",
    paypal: "789101112",
  };

  // 🆔 شناسه روش پرداخت انتخاب‌شده توسط کاربر
  const selectedPaymentMethodId = paymentMethodIdMap[selectedPayment];

  useEffect(() => {
    // ⬅️ ارسال شناسه روش پرداخت انتخاب‌شده به کامپوننت والد (CheckoutSection)
    if (setPaymentMethodId && typeof setPaymentMethodId === "function") {
      setPaymentMethodId(selectedPaymentMethodId || "");
      console.log(
        "[Order] Selected payment method ID updated:",
        selectedPaymentMethodId
      );
    }
  }, [selectedPaymentMethodId]);

  const handleClickPlaceOrder = () => {
    // 🛑 جلوگیری از ثبت سفارش اگر سبد خرید خالی باشد
    if (!cartItems.length) {
      alert("[Order] Your shopping cart is empty.");
      return;
    } else {
      console.log("[Order] Cart items:", cartItems);
    }

    // 🚀 اجرای فرآیند نهایی ثبت سفارش (submitOrder → navigate)
    handlePlaceOrder();
  };

  return (
    <div className="col-md-5 order-details">
      <div className="section-title text-center">
        <h3 className="title">Your Order</h3>
      </div>
      <div className="order-summary">
        <div className="order-col">
          <div>
            <strong>PRODUCT</strong>
          </div>
          <div>
            <strong>TOTAL</strong>
          </div>
        </div>

        <div className="order-products">
          {cartItems.map((item) => (
            <div className="order-col" key={item.id}>
              <div>
                {item.quantity}x {item.label}
              </div>
              <div>€{item.price?.totalPrice?.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="order-col">
          <div>Shipping</div>
          <div>
            <strong>FREE</strong>
          </div>
        </div>

        <div className="order-col">
          <div>
            <strong>TOTAL</strong>
          </div>
          <div>
            <strong className="order-total">€{subtotal.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="payment-method">
        <div className="input-radio">
          <input
            type="radio"
            name="payment"
            id="id-for-bank-transfer"
            value="bank"
            checked={selectedPayment === "bank"}
            onChange={(e) => setSelectedPayment(e.target.value)}
          />{" "}
          <label htmlFor="id-for-bank-transfer">
            <span></span>
            Direct Bank Transfer
          </label>
          <div className="caption">
            <p>
              Please transfer the total amount to our bank account. Your order
              will be processed after the payment is received.
            </p>
          </div>
        </div>
        <div className="input-radio">
          <input
            type="radio"
            name="payment"
            id="id-for-cash-on-delivery"
            value="cash"
            checked={selectedPayment === "cash"}
            onChange={(e) => setSelectedPayment(e.target.value)}
          />
          <label htmlFor="id-for-cash-on-delivery">
            <span></span>
            Cash on delivery
          </label>
          <div className="caption">
            <p>
              Pay for your order in cash when it is delivered to your address.
              No advance payment required.
            </p>
          </div>
        </div>
        <div className="input-radio">
          <input
            type="radio"
            name="payment"
            id="id-for-paypal"
            value="paypal"
            checked={selectedPayment === "paypal"}
            onChange={(e) => setSelectedPayment(e.target.value)}
          />
          <label htmlFor="id-for-paypal">
            <span></span>
            Paypal
          </label>
          <div className="caption">
            <p>
              Pay quickly and securely using your PayPal account. You will be
              redirected to PayPal to complete the payment.
            </p>
          </div>
        </div>
      </div>

      <div className="input-checkbox">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />

        <label htmlFor="terms">
          <span></span>
          I've read and accept the <a href="#">terms & conditions</a>
        </label>
      </div>
      <button
        type="button"
        style={{ width: "100%" }}
        className="primary-btn order-submit"
        onClick={handleClickPlaceOrder}
      >
        Place order
      </button>
    </div>
  );
}
