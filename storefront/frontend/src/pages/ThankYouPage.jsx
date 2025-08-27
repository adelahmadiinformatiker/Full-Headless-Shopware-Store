import React from "react";
import { useLocation, Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function ThankYouPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) return <p>Order not found.</p>;

  return (
    <>
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h3 className="breadcrumb-header">Thank You</h3>
              <ul className="breadcrumb-tree">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li className="active">Thank You</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <h1>Thank You for Your Purchase!</h1>
        <p>Your order was placed successfully.</p>
        <div className="card mt-4 p-3">
          <p>
            <strong>Order Number:</strong> {order.id}
          </p>
          <p>
            <strong>Total:</strong> €{order.totalPrice}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Email:</strong> {order.customerEmail}
          </p>
        </div>
      </div>
    </>
  );
}
