import React from "react";

export default function SectionTitle() {
  return (
    <div className="col-md-12">
      <div className="section-title">
        <h3 className="title">Products</h3>
        <div className="section-nav">
          <ul className="section-tab-nav tab-nav">
            <li className="active">
              <a data-toggle="tab" href="#tab1">
                Laptops
              </a>
            </li>
            <li>
              <a data-toggle="tab" href="#tab1">
                Smartphones
              </a>
            </li>
            <li>
              <a data-toggle="tab" href="#tab1">
                Cameras
              </a>
            </li>
            <li>
              <a data-toggle="tab" href="#tab1">
                Accessories
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
