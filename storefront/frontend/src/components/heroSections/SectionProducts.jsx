import SectionTitle from "./sectionProducts/SectionTitle";
import SectionAllProducts from "./sectionProducts/SectionAllProducts";

export default function SectionNewProducts() {
  return (
    <div className="section">
      <div className="container">
        <div className="row">
          <SectionTitle />
          <SectionAllProducts />
        </div>
      </div>
    </div>
  );
}
