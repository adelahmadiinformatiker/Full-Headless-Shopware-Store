import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../../css/components/_login.css";
import { loginUser } from "../../services/authService";
import { useCart } from "../../context/CartContext";
import { addProductToCart } from "../../services/cartService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { clearGuestCart } = useCart();

  // Helper to get redirect param from query string
  function getRedirectPath() {
    const params = new URLSearchParams(location.search);
    // TODO: In future, use last visited page as fallback
    return params.get("redirect") || "/";
  }

  const handleLogin = async (e) => {
    e.preventDefault(); // جلوگیری از بارگذاری مجدد صفحه
    setLoading(true);
    setError("");

    try {
      // 🔐 ارسال درخواست ورود به سرور و دریافت user و contextToken
      const { user, contextToken } = await loginUser(email, password);

      // 💾 ذخیره contextToken و ایمیل کاربر در localStorage
      localStorage.setItem("contextToken", contextToken);
      localStorage.setItem("userEmail", user.email);

      console.log("[Login] setItems:", {
        contextToken,
        userEmail: user.email,
      });

      // 🛒 اضافه کردن مجدد آیتم‌های سبد خرید مهمان به سبد جدید کاربر لاگین‌شده
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
      for (const item of guestCart) {
        if (item.id && item.quantity) {
          await addProductToCart(item.id, item.quantity);

          console.log(
            `[Login] Added guest cart item to user cart: ${item.id} (qty: ${item.quantity})`
          );
        }
      }

      console.log("[Login] Guest cart items added to user cart successfully");
      // 🧹 پاک‌سازی سبد مهمان پس از مهاجرت به حساب کاربر
      clearGuestCart();

      console.log("[Login] Guest cart cleared after migration!!!!!");

      // 👋 خوش‌آمدگویی و هدایت به مسیر مورد نظر (از query string)
      alert(`Welcome, ${user.email}!`);
      navigate(getRedirectPath(), { replace: true });
    } catch (err) {
      // 🧯 مدیریت خطای 401 (اطلاعات اشتباه) با پیام دوستانه
      if (
        err.message === "Request failed with status code 401" ||
        err.message.toLowerCase().includes("401") ||
        err.message.toLowerCase().includes("unauthorized")
      ) {
        setError(
          <span>
            Login failed: Incorrect email or password.
            <br />
            If you have not registered yet, please{" "}
            <Link to="/auth/register">register here</Link>.
          </span>
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-fluid auth-d-flex auth-justify-content-center auth-align-items-center auth-min-vh-100">
      <div
        className="auth-row auth-shadow auth-p-3 auth-rounded ai-style-change-2"
        style={{ maxWidth: "900px", width: "100%", position: "relative" }}
      >
        <Link
          to="/"
          className="auth-btn-close auth-position-absolute"
          style={{ top: 16, right: 16, zIndex: 10 }}
          aria-label="Close"
        ></Link>
        <div className="auth-col-md-6 auth-d-none auth-d-md-block ai-style-change-3">
          <img
            src="https://placehold.co/600x400"
            alt="Login visual placeholder"
            className="auth-img-placeholder"
          />
        </div>

        <div className="auth-col-md-6 auth-p-4">
          <div className="section-title">
            <h3 className="auth-title auth-text-center auth-mb-4">Login</h3>
          </div>
          {error && <div className="auth-alert auth-alert-danger">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="auth-form-group">
              <input
                className="auth-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-group">
              <input
                className="auth-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="auth-d-flex auth-justify-content-between auth-align-items-center auth-mb-3 ai-style-change-1">
              {/* Remember me */}
              <div className="input-checkbox auth-mb-0">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">
                  <span></span>
                  Remember me
                </label>
              </div>

              {/* Forgot password */}
              <a href="#" className="auth-text-muted auth-small">
                Forgot password?
              </a>
            </div>

            <div className="auth-form-group auth-mt-4">
              <button
                type="submit"
                className="primary-btn auth-btn-block auth-w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="auth-d-flex auth-justify-content-center auth-align-items-center auth-mt-3">
                <p className="auth-text-muted auth-small">
                  Don't have an account?{" "}
                  <Link to="/auth/register" className="auth-text-primary">
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
