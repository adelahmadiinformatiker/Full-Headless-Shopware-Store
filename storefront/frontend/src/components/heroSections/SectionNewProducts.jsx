import React from "react";
import SectionTitle from "./sectionProducts/SectionTitle";
import SectionAllProductsDummyData from "./sectionProducts/SectionAllProductsDummyData";

export default function SectionNewProducts() {
  return (
    <div className="section">
      <div className="container">
        <div className="row">
          <SectionTitle />
          <SectionAllProductsDummyData />
        </div>
      </div>
    </div>
  );
}
