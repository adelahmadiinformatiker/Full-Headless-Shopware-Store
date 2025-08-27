import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const HeaderTop = () => {
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));

  useEffect(() => {
    // Listen for login/register changes (when localStorage changes)
    const onStorage = () => setUserEmail(localStorage.getItem("userEmail"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("contextToken");
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    // Optionally, reload or redirect
    window.location.reload();
  };

  return (
    <div id="top-header">
      <div className="container">
        <ul className="header-links pull-left">
          <li>
            <a href="#">
              <i className="fa fa-phone"></i> +021-95-51-84
            </a>
          </li>
          <li>
            <a href="#">
              <i className="fa fa-envelope-o"></i> email@email.com
            </a>
          </li>
          <li>
            <a href="#">
              <i className="fa fa-map-marker"></i> 1734 Stonecoal Road
            </a>
          </li>
        </ul>
        <ul className="header-links pull-right">
          <li>
            <a href="#">
              <i className="fa fa-dollar"></i> USD
            </a>
          </li>
          <li>
            {userEmail ? (
              <>
                <span>
                  <i className="fa fa-user-o"></i> {userEmail}
                </span>
                <button onClick={handleLogout} style={{ marginLeft: 8 }}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/authentication">
                <i className="fa fa-user-o"></i> My Account
              </Link>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderTop;
