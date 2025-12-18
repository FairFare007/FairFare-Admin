import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
// import Admin from "../models/Admin.model.js";

const router = express.Router();

// router.post("/name", async (req, res) => {
//   console.log("hiii");
//   const {email} = req.body;
//   console.log(req);
//   const admin = await Admin.findOne({ email });
//   return res.status(200).json({ name: admin.name });
// });

// router.get("/dashboard", authMiddleware, (req, res) => {
//   res.json({
//     message: "Welcome to admin dashboard",
//     admin: req.admin,
//   });
// });

export default router;
