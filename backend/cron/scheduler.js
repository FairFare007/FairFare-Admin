import cron from "node-cron";
import { generateAndSendDailyReport } from "../services/dailyEmailReport.js";

/**
 * Start all cron jobs for the application.
 */
export function startCronJobs() {
    // Schedule daily analytics email at 8:00 AM IST
    cron.schedule("23 9 * * *", async () => {
        console.log("[CRON] Running daily analytics email...");
        await generateAndSendDailyReport();
        console.log("[CRON] Daily analytics email job completed.");
    }, {
        timezone: "Asia/Kolkata"
    });

    console.log("[CRON] Daily report scheduled for 8:00 AM IST");
}
