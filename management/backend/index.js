// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

// Import required packages
import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);

// Health check route
app.get("/", (_req, res) => {
  res.send("✅ Backend is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
  console.log(`🔗 API is available at http://localhost:${PORT}/api`);
  console.log(`🔗 Products are available at http://localhost:${PORT}/products`);
});
