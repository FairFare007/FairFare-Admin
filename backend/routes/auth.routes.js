import express from "express";
import { adminLogin } from "../controllers/auth.controller.js";
import { refreshAccessToken } from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/login", adminLogin);
router.post("/refresh", refreshAccessToken);

export default router;
