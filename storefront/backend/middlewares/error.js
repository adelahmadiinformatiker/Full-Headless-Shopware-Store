// backend/middlewares/error.js
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const details = err.response?.data || undefined;

  if (process.env.NODE_ENV !== "production") {
    console.error("[BFF ERROR]", message, details || "");
  }

  res.status(status).json({ message, details });
}
