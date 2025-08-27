import React from "react";

export default function BillingAndShippingAddress({
  billingInfo,
  setBillingInfo,
  shippingInfo,
  setShippingInfo,
  orderNotes,
  setOrderNotes,
}) {
  const handleBillingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBillingInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="col-md-7">
      <div className="billing-details">
        <div className="section-title">
          <h3 className="title">Billing address</h3>
        </div>
        <div className="form-group">
          <input
            className="input"
            type="text"
            name="firstName"
            placeholder="First Name"
            value={billingInfo.firstName}
            onChange={handleBillingChange}
          />
        </div>
        <div className="form-group">
          <input
            className="input"
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={billingInfo.lastName}
            onChange={handleBillingChange}
          />
        </div>
        <div className="form-group">
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={billingInfo.email}
            onChange={handleBillingChange}
          />
        </div>
        <div className="form-group">
          <input
            className="input"
            type="text"
            name="address"
            placeholder="Address"
            value={billingInfo.address}
            onChange={handleBillingChange}
          />
        </div>
        <div className="form-group">
          <input
            className="input"
            type="text"
            name="city"
            placeholder="City"
            value={billingInfo.city}
            onChange={handleBillingChange}
          />
        </div>
        <div className="form-group">
          <input
            className="input"
            type="text"
            name="country"
            placeholder="Country"
            value={billingInfo.country}
            onChange={handleBillingChange}
          />
        </div>
        <div className="form-group">
          <input
            className="input"
            type="text"
            name="zip"
            placeholder="ZIP Code"
            value={billingInfo.zip}
            onChange={handleBillingChange}
          />
        </div>
        <div className="form-group">
          <input
            className="input"
            type="tel"
            name="tel"
            placeholder="Telephone"
            value={billingInfo.tel}
            onChange={handleBillingChange}
          />
        </div>
        <div className="form-group">
          <div className="input-checkbox">
            <input
              type="checkbox"
              id="create-account"
              name="createAccount"
              checked={billingInfo.createAccount}
              onChange={handleBillingChange}
            />
            <label htmlFor="create-account">
              <span></span>
              Create Account?
            </label>
            {billingInfo.createAccount && (
              <div className="caption">
                <p>
                  Create an account with a password to track your orders and
                  simplify future checkouts.
                </p>
                <input
                  className="input"
                  type="password"
                  name="password"
                  placeholder="Enter Your Password"
                  value={billingInfo.password}
                  onChange={handleBillingChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shiping-details">
        <div className="section-title">
          <h3 className="title">Shipping address</h3>
        </div>
        <div className="input-checkbox">
          <input
            type="checkbox"
            id="shiping-address"
            checked={shippingInfo.enabled}
            onChange={(e) =>
              setShippingInfo((prev) => ({
                ...prev,
                enabled: e.target.checked,
              }))
            }
          />
          <label htmlFor="shiping-address">
            <span></span>
            Ship to a different address?
          </label>
          {shippingInfo.enabled && (
            <div className="caption">
              {[
                "firstName",
                "lastName",
                "email",
                "address",
                "city",
                "country",
                "zip",
                "tel",
              ].map((field) => (
                <div className="form-group" key={field}>
                  <input
                    className="input"
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    placeholder={field.replace(/([A-Z])/g, " $1")}
                    value={shippingInfo[field]}
                    onChange={handleShippingChange}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="order-notes">
        <textarea
          className="input"
          placeholder="Order Notes"
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
}
