import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="col-md-3 col-xs-6">
      <div className="product">
        <div className="product-img">
          <img src={product.image} alt={product.name} />
          <div className="product-label">
            {product.sale && <span className="sale">-30%</span>}
            {product.new && <span className="new">NEW</span>}
          </div>
        </div>
        <div className="product-body">
          <p className="product-category">{product.category}</p>
          <h3 className="product-name"><a href="#">{product.name}</a></h3>
          <h4 className="product-price">${product.price}</h4>
          <div className="product-rating">
            {[...Array(5)].map((_, i) => (
              <i key={i} className="fa fa-star" />
            ))}
          </div>
          <div className="product-btns">
            <button className="add-to-wishlist"><i className="fa fa-heart-o"></i><span className="tooltipp">add to wishlist</span></button>
            <button className="add-to-compare"><i className="fa fa-exchange"></i><span className="tooltipp">add to compare</span></button>
            <button className="quick-view"><i className="fa fa-eye"></i><span className="tooltipp">quick view</span></button>
          </div>
        </div>
        <div className="add-to-cart">
          <button className="add-to-cart-btn"><i className="fa fa-shopping-cart"></i> add to cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
