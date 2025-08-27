import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Layout and Common Pages
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import ThankYouPage from "./pages/ThankYouPage";

// Authentication
import Authentication from "./pages/Authentication";
import Login from "./components/authenticationSection/Login";
import Register from "./components/authenticationSection/Register";

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const location = useLocation();
  const contextToken = localStorage.getItem("contextToken");
  if (!contextToken) {
    return (
      <Navigate
        to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Auth routes without layout */}
      <Route path="/auth" element={<Authentication />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route
        path="/authentication"
        element={<Navigate to="/auth/login" replace />}
      />

      {/* Routes with layout */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Layout>
              <Checkout />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-success/:orderId"
        element={
          <Layout>
            <ThankYouPage />
          </Layout>
        }
      />
    </Routes>
  );
}
