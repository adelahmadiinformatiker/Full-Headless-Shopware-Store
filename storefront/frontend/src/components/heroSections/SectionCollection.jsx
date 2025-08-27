import React from "react";
import product01 from "/img/product01.png";
import product02 from "/img/product02.png";
import product03 from "/img/product03.png";

export default function SectionCollection() {
  return (
    <div className="section">
      <div className="container">
        <div className="row">
          <div className="col-md-4 col-xs-6">
            <div className="shop">
              <div className="shop-img">
                <img src={product01} alt="product01" />
              </div>
              <div className="shop-body">
                <h3>
                  Laptop
                  <br />
                  Collection
                </h3>
                <a href="#" className="cta-btn">
                  Shop now <i className="fa fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-4 col-xs-6">
            <div className="shop">
              <div className="shop-img">
                <img src={product02} alt="product02" />
              </div>
              <div className="shop-body">
                <h3>
                  Accessories
                  <br />
                  Collection
                </h3>
                <a href="#" className="cta-btn">
                  Shop now <i className="fa fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-4 col-xs-6">
            <div className="shop">
              <div className="shop-img">
                <img src={product03} alt="product03" />
              </div>
              <div className="shop-body">
                <h3>
                  Cameras
                  <br />
                  Collection
                </h3>
                <a href="#" className="cta-btn">
                  Shop now <i className="fa fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
