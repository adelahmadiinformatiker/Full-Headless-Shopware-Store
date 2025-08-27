import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../../css/components/_login.css";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "Ali",
    lastName: "Ahmadi",
    email: "test@example.com",
    password: "123456789",
    confirmPassword: "123456789",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper to get redirect param from query string
  function getRedirectPath() {
    const params = new URLSearchParams(location.search);
    // TODO: In future, use last visited page as fallback
    return params.get("redirect") || "/";
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("contextToken", data.contextToken);
      localStorage.setItem("userEmail", formData.email); // Store user email for header
      navigate(getRedirectPath(), { replace: true });
    } catch (err) {
      setError(err.message);
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
            alt="Register visual placeholder"
            className="auth-img-placeholder"
          />
        </div>

        <div className="auth-col-md-6 auth-p-4">
          <div className="section-title">
            <h3 className="auth-title auth-text-center auth-mb-4">Register</h3>
          </div>
          {error && <div className="auth-alert auth-alert-danger">{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="auth-form-group">
              <input
                className="auth-input"
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-form-group">
              <input
                className="auth-input"
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-form-group">
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-form-group">
              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-form-group">
              <input
                className="auth-input"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-form-group auth-mt-4">
              <button
                type="submit"
                className="primary-btn auth-btn-block auth-w-100"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
          <div className="auth-d-flex auth-justify-content-center auth-align-items-center auth-mt-3">
            <p className="auth-text-muted auth-small">
              Already have an account?{" "}
              <Link to="/auth/login" className="auth-text-primary">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
