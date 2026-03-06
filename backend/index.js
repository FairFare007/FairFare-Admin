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

//Ping Route
app.get("/api/ping", (req, res) => {
  res.send("ponging");
});

// Auth routes (login, access requests - partially public)
app.use("/api/auth", authRoutes);

// Protected API routes (require admin login)
app.use("/api", verifyAdmin, metricRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Self-ping function to prevent Render sleeping
function keepServerAwake() {
  // Ping every 5 minutes
  setInterval(async () => {
    try {
      const url = process.env.RENDER_EXTERNAL_URL
        ? `${process.env.RENDER_EXTERNAL_URL}/api/ping`
        : `http://localhost:${PORT}/api/ping`;

      const response = await fetch(url);
      const data = await response.text();
      console.log(`[SELF-PING] Success: ${data} at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error(`[SELF-PING] Failed: ${err.message}`);
    }
  }, 5 * 60 * 1000);
}

keepServerAwake();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJobs();
});

