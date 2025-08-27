import React, { useEffect } from "react";
import HeaderTop from "./headerPart/HeaderTop";
import HeaderMain from "./headerPart/HeaderMain";

const Header = () => {
  useEffect(() => {
    // Trigger jQuery again after React mounts elements
    if (window.$) {
      window
        .$(".menu-toggle > a")
        .off("click")
        .on("click", function (e) {
          e.preventDefault();
          window.$("#responsive-nav").toggleClass("active");
        });
    }
  }, []);

  return (
    <header>
      <HeaderTop />
      <HeaderMain />
    </header>
  );
};

export default Header;
