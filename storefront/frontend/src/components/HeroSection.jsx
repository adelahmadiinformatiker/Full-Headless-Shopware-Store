import React, { useEffect } from "react";
import SectionProducts from "./heroSections/SectionProducts.jsx";

const HeroSection = () => {
  // Just for Dummy Slider
  useEffect(() => {
    const runSlick = () => {
      if (window.$ && window.$(".products-slick").length > 0) {
        window.$(".products-slick").each(function () {
          const $this = window.$(this);

          // Check if element exists and has children
          if ($this.length === 0 || $this.children().length === 0) {
            return;
          }

          const $nav = $this.attr("data-nav");
          const $navElement = $nav ? window.$($nav) : null;

          // Destroy existing slick instance if it exists
          if ($this.hasClass("slick-initialized")) {
            $this.slick("unslick");
          }

          $this.slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            autoplay: true,
            infinite: true,
            speed: 300,
            dots: false,
            arrows: true,
            appendArrows:
              $navElement && $navElement.length > 0 ? $navElement : undefined,
            responsive: [
              { breakpoint: 991, settings: { slidesToShow: 2, arrows: true } },
              { breakpoint: 480, settings: { slidesToShow: 1, arrows: true } },
            ],
          });
        });
      }
    };

    // Wait for DOM to be ready and then run slick
    const timer = setTimeout(runSlick, 200);

    return () => {
      clearTimeout(timer);
      // Cleanup slick instances on unmount
      if (window.$) {
        window.$(".products-slick").each(function () {
          const $this = window.$(this);
          if ($this.hasClass("slick-initialized")) {
            $this.slick("unslick");
          }
        });
      }
    };
  }, []);

  return (
    <div>
      {/* <SectionCollection />
      <SectionNewProducts />
      <SectionHotDeal />
      <SectionTopSelling /> */}
      {/* <SectionNewProducts /> */}
      <SectionProducts />
      {/* <TestSlider /> */}
    </div>
  );
};

export default HeroSection;
