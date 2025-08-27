// frontend-headless\src\components\Layout.jsx

import Header from "./Header";
import Navbar from "./Navbar";
import Newsletter from "./Newsletter";
import Footer from "./Footer";
import { CartProvider } from "../context/CartContext";

const Layout = ({ children }) => {
  return (
    <CartProvider>
      <Header />
      <Navbar />
      <main>{children}</main>
      <Newsletter />
      <Footer />
    </CartProvider>
  );
};

export default Layout;
