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

// ✅ Self-ping function to prevent Render sleeping
function keepServerAwake() {
  setInterval(() => {
    fetch("https://fairfare-0hyl.onrender.com/api/ping")
      .then((res) => res.text())
      .then((data) => console.log("Self-ping successfully:", data))
      .catch((err) => console.log("Self-ping failed:", err.message));
  }, 5 * 60 * 1000); // every 5 minutes
}

keepServerAwake();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startCronJobs();
});

