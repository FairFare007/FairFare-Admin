import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/conn.js";
import metricRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { verifyAdmin } from "./middleware/authMiddleware.js";
import { startCronJobs } from "./cron/scheduler.js";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth routes (login, access requests - partially public)
app.use("/api/auth", authRoutes);

// Protected API routes (require admin login)
app.use("/api", verifyAdmin, metricRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startCronJobs();
});

