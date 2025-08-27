import React from "react";

export default function FooterBottom() {
  return (
    <div id="bottom-footer" className="section">
      <div className="container">
        <div className="row">
          <div className="col-md-12 text-center">
            <ul className="footer-payments">
              <li>
                <a href="#">
                  <i className="fa fa-cc-visa"></i>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa fa-credit-card"></i>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa fa-cc-paypal"></i>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa fa-cc-mastercard"></i>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa fa-cc-discover"></i>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa fa-cc-amex"></i>
                </a>
              </li>
            </ul>
            <span className="copyright">
              Copyright &copy;
              <script>document.write(new Date().getFullYear());</script> All
              rights reserved | This template is made with{" "}
              <i className="fa fa-heart-o" aria-hidden="true"></i> by{" "}
              <a href="https://colorlib.com" target="_blank">
                Colorlib
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
