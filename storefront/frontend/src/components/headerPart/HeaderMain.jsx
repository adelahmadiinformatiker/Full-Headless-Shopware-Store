import React from "react";
import logo from "/img/logo.png";
import { Link } from "react-router-dom";

import HeaderSearch from "./headerMain/HeaderSearch";
import HeaderWishlist from "./headerMain/HeaderWishlist";
import HeaderCart from "./headerMain/HeaderCart";

const HeaderMain = () => {
  return (
    <div id="header">
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <div className="header-logo">
              <Link to="/" className="logo">
                <img src={logo} />
              </Link>
            </div>
          </div>
          <div className="col-md-6">
            <HeaderSearch />
          </div>
          <div className="col-md-3 clearfix">
            <div className="header-ctn">
              <HeaderWishlist />
              <HeaderCart />
              <div className="menu-toggle">
                <a href="#">
                  <i className="fa fa-bars"></i>
                  <span>Menu</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderMain;
