// routes/authRoutes.js

import express from "express";
import {
  register,
  login,
  shopwareLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/shopware-login", shopwareLogin);

export default router;
