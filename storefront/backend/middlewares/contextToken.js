// backend/middlewares/contextToken.js
import axios from "axios";

export async function ensureContextToken(req, res, next) {
  const cookieName = "sw-context-token";
  const base =
    process.env.STORE_API_BASE || `${process.env.SHOPWARE_API_BASE}/store-api`;
  const accessKey =
    process.env.SALES_CHANNEL_ACCESS_KEY || process.env.SHOPWARE_ACCESS_KEY;

  try {
    // ✅ 1) Prefer header token
    let token =
      req.get("sw-context-token") ||
      req.get("SW-Context-Token") ||
      req.cookies?.[cookieName];

    if (!token) {
      // ✅ 2) Only if no header/cookie → create once
      const resp = await axios.get(`${base}/context`, {
        headers: { "sw-access-key": accessKey },
      });
      token = resp.headers["sw-context-token"] || resp.data?.token;
      res.cookie(cookieName, token, {
        httpOnly: false,
        sameSite: "lax",
        secure: false,
        path: "/",
      });
    }

    req.contextToken = token;
    res.set("sw-context-token", token);
    next();
  } catch (err) {
    err.status = err.response?.status || 500;
    next(err);
  }
}
