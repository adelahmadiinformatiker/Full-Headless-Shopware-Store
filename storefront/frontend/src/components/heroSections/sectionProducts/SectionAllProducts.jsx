// storefront\frontend\src\components\heroSections\sectionProducts\SectionAllProducts.jsx

import React, { useEffect, useState } from "react";
import { fetchProducts } from "../../../js/fetchProducts";
import { useCart } from "../../../context/CartContext";
import "../../../../public/css/realProducts.css";

export default function SectionAllProducts() {
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts().then((res) => {
      setProducts(res);
    });
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      await addItem(productId, 1);
      alert("Product added to cart!");
    } catch (err) {
      console.error("Error while adding product to cart:", err); // log for debugging
      alert("Failed to add product to cart.");
    }
  };

  return (
    <div className="col-md-12 section-all-products">
      <div className="row">
        {products.map((product) => (
          <div
            key={product.id}
            className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex align-items-stretch"
          >
            <div className="product w-100">
              <div className="product-img">
                <img
                  src={
                    product.cover?.media?.url ||
                    "https://via.placeholder.com/300?text=No+Image"
                  }
                  alt={product.name}
                />
                <div className="product-label">
                  <span className="sale">-30%</span>
                  <span className="new">NEW</span>
                </div>
              </div>
              <div className="product-body">
                <p className="product-category">Category</p>
                <h3 className="product-name">
                  <a href="#">{product.name}</a>
                </h3>
                <h4 className="product-price">
                  €{product.calculatedPrice?.unitPrice?.toFixed(2) || "0.00"}{" "}
                  <del className="product-old-price">
                    €{(product.calculatedPrice?.unitPrice + 10).toFixed(2)}
                  </del>
                </h4>
                <div className="product-rating">
                  <i className="fa fa-star"></i>
                  <i className="fa fa-star"></i>
                  <i className="fa fa-star"></i>
                  <i className="fa fa-star"></i>
                  <i className="fa fa-star"></i>
                </div>
                <div className="product-btns">
                  <button className="add-to-wishlist">
                    <i className="fa fa-heart-o"></i>
                    <span className="tooltipp">add to wishlist</span>
                  </button>
                  <button className="add-to-compare">
                    <i className="fa fa-exchange"></i>
                    <span className="tooltipp">add to compare</span>
                  </button>
                  <button className="quick-view">
                    <i className="fa fa-eye"></i>
                    <span className="tooltipp">quick view</span>
                  </button>
                </div>
              </div>
              <div className="add-to-cart">
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product.id)}
                >
                  <i className="fa fa-shopping-cart"></i> add to cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
