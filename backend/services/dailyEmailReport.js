import { User, Group, Expense, Ticket } from "../models/schema.js";
import { sendMail } from "../utils/mailClient.js";

/**
 * Get the start of a day in IST (Asia/Kolkata, UTC+5:30).
 * Returns a UTC Date object representing midnight IST for the given offset.
 * @param {number} daysAgo - 0 = today, 1 = yesterday, 2 = day before yesterday
 */
function getISTDayStart(daysAgo = 0) {
    const now = new Date();
    // IST is UTC+5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);

    // Set to midnight IST
    istNow.setUTCHours(0, 0, 0, 0);
    // Subtract days
    istNow.setUTCDate(istNow.getUTCDate() - daysAgo);

    // Convert back to UTC
    return new Date(istNow.getTime() - istOffset);
}

/**
 * Query metrics for a specific day range [dayStart, dayEnd).
 */
async function getMetricsForDay(dayStart, dayEnd) {
    const [
        newSignups,
        activeUsers,
        expensesCreated,
        volumeResult,
        newGroups,
        aiUsageResult,
        openTickets
    ] = await Promise.all([
        // New signups
        User.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),

        // Daily active users
        User.countDocuments({ lastActive: { $gte: dayStart, $lt: dayEnd, $ne: null, $exists: true } }),

        // Expenses created
        Expense.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),

        // Transaction volume
        Expense.aggregate([
            { $match: { createdAt: { $gte: dayStart, $lt: dayEnd } } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]),

        // New groups
        Group.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),

        // AI usage (users who used AI on that day)
        User.aggregate([
            { $match: { "aiChatUsage.lastUsed": { $gte: dayStart, $lt: dayEnd } } },
            { $group: { _id: null, totalUsage: { $sum: "$aiChatUsage.count" } } }
        ]),

        // Open tickets (always current, not day-specific)
        Ticket.countDocuments({ status: "Open" })
    ]);

    return {
        newSignups,
        activeUsers,
        expensesCreated,
        transactionVolume: volumeResult.length > 0 ? volumeResult[0].totalAmount : 0,
        newGroups,
        aiUsage: aiUsageResult.length > 0 ? aiUsageResult[0].totalUsage : 0,
        openTickets
    };
}

/**
 * Format a number with Indian-style formatting (e.g., 1,23,456).
 */
function formatIndian(num) {
    if (num === 0) return "0";
    const str = Math.round(num).toString();
    if (str.length <= 3) return str;
    const last3 = str.slice(-3);
    const rest = str.slice(0, -3);
    const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return formatted + "," + last3;
}

/**
 * Get a change indicator arrow + percentage.
 */
function getChangeIndicator(current, previous) {
    if (previous === 0 && current === 0) return { arrow: "—", color: "#6b7280", text: "No change" };
    if (previous === 0) return { arrow: "↑", color: "#10b981", text: "New" };

    const change = ((current - previous) / previous) * 100;
    if (change > 0) return { arrow: "↑", color: "#10b981", text: `+${Math.round(change)}%` };
    if (change < 0) return { arrow: "↓", color: "#ef4444", text: `${Math.round(change)}%` };
    return { arrow: "—", color: "#6b7280", text: "0%" };
}

/**
 * Build the HTML email template.
 */
function buildEmailHTML(yesterday, dayBefore, reportDate) {
    const metrics = [
        { label: "New Signups", icon: "👤", value: yesterday.newSignups, prev: dayBefore.newSignups },
        { label: "Active Users (DAU)", icon: "📱", value: yesterday.activeUsers, prev: dayBefore.activeUsers },
        { label: "Expenses Created", icon: "🧾", value: yesterday.expensesCreated, prev: dayBefore.expensesCreated },
        { label: "Transaction Volume", icon: "💰", value: yesterday.transactionVolume, prev: dayBefore.transactionVolume, prefix: "₹", format: true },
        { label: "New Groups", icon: "👥", value: yesterday.newGroups, prev: dayBefore.newGroups },
        { label: "AI Queries", icon: "🤖", value: yesterday.aiUsage, prev: dayBefore.aiUsage },
        { label: "Open Tickets", icon: "🎫", value: yesterday.openTickets, prev: dayBefore.openTickets },
    ];

    const metricCards = metrics.map(m => {
        const change = getChangeIndicator(m.value, m.prev);
        const displayValue = m.format
            ? `${m.prefix || ""}${formatIndian(m.value)}`
            : m.value;

        return `
            <tr>
                <td style="padding: 8px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 12px; overflow: hidden;">
                        <tr>
                            <td style="padding: 20px 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="font-size: 14px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif;">
                                            ${m.icon} ${m.label}
                                        </td>
                                        <td align="right" style="font-size: 13px; color: ${change.color}; font-family: 'Segoe UI', Arial, sans-serif; font-weight: 600;">
                                            ${change.arrow} ${change.text}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" style="font-size: 28px; font-weight: 700; color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; padding-top: 8px;">
                                            ${displayValue}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>`;
    }).join("");

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FairFare Daily Report</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a;">
            <tr>
                <td align="center" style="padding: 32px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 8px 16px 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 28px 24px; text-align: center;">
                                            <div style="font-size: 28px; font-weight: 800; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif;">
                                                📊 FairFare Daily Report
                                            </div>
                                            <div style="font-size: 15px; color: rgba(255,255,255,0.85); margin-top: 8px; font-family: 'Segoe UI', Arial, sans-serif;">
                                                ${reportDate}
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Metric Cards -->
                        ${metricCards}

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 16px 8px; text-align: center;">
                                <div style="font-size: 12px; color: #475569; font-family: 'Segoe UI', Arial, sans-serif;">
                                    Compared to the day before · Auto-generated at 8:00 AM IST
                                </div>
                                <div style="font-size: 12px; color: #334155; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 4px;">
                                    FairFare Admin · Daily Analytics Digest
                                </div>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}

/**
 * Main function: Gather yesterday's metrics and send the email.
 */
export async function generateAndSendDailyReport() {
    const adminEmailRaw = process.env.ADMIN_EMAIL;

    if (!adminEmailRaw) {
        console.error("[DAILY REPORT] ADMIN_EMAIL env var is not set. Skipping report.");
        return;
    }

    // Support comma-separated emails
    const adminEmails = adminEmailRaw.split(",").map(e => e.trim()).filter(Boolean);

    if (adminEmails.length === 0) {
        console.error("[DAILY REPORT] No valid emails found in ADMIN_EMAIL. Skipping report.");
        return;
    }

    try {
        console.log("[DAILY REPORT] Generating daily analytics report...");

        // Calculate day boundaries in IST
        const todayStart = getISTDayStart(0);       // Today midnight IST
        const yesterdayStart = getISTDayStart(1);    // Yesterday midnight IST
        const dayBeforeStart = getISTDayStart(2);    // Day before yesterday midnight IST

        // Fetch metrics for both days
        const [yesterdayMetrics, dayBeforeMetrics] = await Promise.all([
            getMetricsForDay(yesterdayStart, todayStart),
            getMetricsForDay(dayBeforeStart, yesterdayStart)
        ]);

        // Format the report date (yesterday's date in IST)
        const reportDate = new Date(yesterdayStart.getTime() + 5.5 * 60 * 60 * 1000)
            .toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });

        // Build email content once
        const html = buildEmailHTML(yesterdayMetrics, dayBeforeMetrics, reportDate);
        const text = `FairFare Daily Report for ${reportDate}\n\nNew Signups: ${yesterdayMetrics.newSignups}\nActive Users: ${yesterdayMetrics.activeUsers}\nExpenses Created: ${yesterdayMetrics.expensesCreated}\nTransaction Volume: ₹${formatIndian(yesterdayMetrics.transactionVolume)}\nNew Groups: ${yesterdayMetrics.newGroups}\nAI Queries: ${yesterdayMetrics.aiUsage}\nOpen Tickets: ${yesterdayMetrics.openTickets}`;
        const subject = `📊 FairFare Daily Report — ${reportDate}`;

        // Send to all admin emails in parallel
        await Promise.all(
            adminEmails.map(email => sendMail({ to: email, subject, html, text }))
        );

        console.log("[DAILY REPORT] Report sent successfully to", adminEmails.join(", "));
    } catch (error) {
        console.error("[DAILY REPORT] Failed to generate/send report:", error.message);
    }
}
