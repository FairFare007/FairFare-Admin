import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/conn.js";
import metricRoutes from "./routes/route.js";
import { startCronJobs } from "./cron/scheduler.js";
// import adminRoutes from "./routes/admin.js"; // Uncomment if admin routes are needed and controller exists

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", metricRoutes);
// app.use("/api/admin", adminRoutes); 

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startCronJobs();
});
