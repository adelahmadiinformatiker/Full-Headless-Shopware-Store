import BillingAndShippingAddress from "./checkoutSection/BillingAndShippingAddress";
import Order from "./checkoutSection/Order";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { submitOrder } from "../services/orderService";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { clearShopwareCart } from "../services/cartService";

export default function CheckoutSection() {
  const navigate = useNavigate();
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const { cartItems, refreshCart } = useCart(); // refreshCart اضافه شود

  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
    tel: "",
    createAccount: false,
    password: "",
  });

  const [shippingInfo, setShippingInfo] = useState({
    enabled: false,
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "",
    tel: "",
  });

  const [orderNotes, setOrderNotes] = useState("");

  const handlePlaceOrder = async () => {
    if (!paymentMethodId) {
      alert("Please select a payment method.");
      return;
    }

    if (!cartItems.length) {
      alert("Your shopping cart is empty.");
      return;
    }

    if (!billingInfo.email || !cartItems[0]?.referencedId) {
      alert(
        "Please complete your billing email and make sure a product exists."
      );
      return;
    }

    try {
      const response = await submitOrder({
        billingInfo,
        shippingInfo,
        paymentMethodId,
      });
      const orderId =
        response?.orderNumber || response?.id || response?.orderId;
      if (!orderId) throw new Error("Order ID missing from response");

      // ⚡️ آماده‌سازی داده برای Club Manager
      const clubPayload = {
        orderId,
        customerEmail: billingInfo.email,
        productId: cartItems[0]?.referencedId || cartItems[0]?.productId,
      };

      await axios.post(
        "http://localhost:5000/api/webhooks/order-paid",
        clubPayload
      );

      await clearShopwareCart(); // اینجا باید انجام شود
      await refreshCart();

      console.log("[CheckoutSection] Cart cleared after order submission");
      window.dispatchEvent(new Event("forceRefreshCart"));

      // localStorage.removeItem("cartItems");

      navigate(`/order-success/${orderId}`, {
        state: {
          order: {
            id: orderId,
            customerEmail: billingInfo.email,
            totalPrice: response?.price?.totalPrice || 0,
            status: response?.stateMachineState?.translated?.name || "Pending",
          },
        },
      });
    } catch (err) {
      console.error("[CheckoutSection] Error placing order:", err);
      alert("Bestellung fehlgeschlagen – bitte erneut versuchen.");
    }
  };

  return (
    <>
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h3 className="breadcrumb-header">Checkout</h3>
              <ul className="breadcrumb-tree">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li className="active">Checkout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <BillingAndShippingAddress
                billingInfo={billingInfo}
                setBillingInfo={setBillingInfo}
                shippingInfo={shippingInfo}
                setShippingInfo={setShippingInfo}
                orderNotes={orderNotes}
                setOrderNotes={setOrderNotes}
              />
              <Order
                billingInfo={billingInfo}
                shippingInfo={shippingInfo}
                orderNotes={orderNotes}
                handlePlaceOrder={handlePlaceOrder}
                setPaymentMethodId={setPaymentMethodId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
