import { User } from "../models/schema.js";
import { sendMail } from "../utils/mailClient.js";
import { logActivity } from "../utils/activityLogger.js";

/**
 * Build a beautiful, colorful HTML email wrapper for campaign emails.
 */
function buildCampaignEmail({ title, body }) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a;">
            <tr>
                <td align="center" style="padding: 32px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">

                        <!-- Decorative Top Accent -->
                        <tr>
                            <td style="height: 6px; background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa, #c084fc, #e879f9, #f472b6, #fb7185); border-radius: 12px 12px 0 0;"></td>
                        </tr>

                        <!-- Header -->
                        <tr>
                            <td style="padding: 0;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7); border-radius: 0;">
                                    <tr>
                                        <td style="padding: 40px 32px; text-align: center;">
                                            <div style="font-size: 42px; margin-bottom: 12px;">📢</div>
                                            <div style="font-size: 28px; font-weight: 800; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.3;">
                                                ${title}
                                            </div>
                                            <div style="margin-top: 12px; width: 60px; height: 3px; background: rgba(255,255,255,0.4); border-radius: 2px; display: inline-block;"></div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 0;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b;">
                                    <tr>
                                        <td style="padding: 32px;">
                                            <div style="font-size: 15px; color: #cbd5e1; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.8;">
                                                ${body}
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Decorative Divider -->
                        <tr>
                            <td style="padding: 0;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b;">
                                    <tr>
                                        <td style="padding: 0 32px;">
                                            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent);"></div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 0;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 0 0 12px 12px;">
                                    <tr>
                                        <td style="padding: 24px 32px 32px; text-align: center;">
                                            <div style="font-size: 20px; margin-bottom: 8px;">💚</div>
                                            <div style="font-size: 13px; color: #64748b; font-family: 'Segoe UI', Arial, sans-serif;">
                                                You're receiving this because you're a valued FairFare user.
                                            </div>
                                            <div style="font-size: 12px; color: #475569; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 8px;">
                                                FairFare Team ✨
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Bottom Accent -->
                        <tr>
                            <td style="height: 4px; background: linear-gradient(90deg, #fb7185, #f472b6, #e879f9, #c084fc, #a78bfa, #8b5cf6, #6366f1); border-radius: 0 0 12px 12px;"></td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;

    const text = `${title}\n\n${body.replace(/<[^>]*>/g, "")}\n\n— FairFare Team`;

    return { html, text, subject: title };
}

/**
 * POST /send-email-campaign
 * Send an email campaign to all or selected FairFare users.
 * Body: { title, body, emails? } — if emails array is provided, send only to those.
 */
export const sendEmailCampaign = async (req, res) => {
    try {
        const { title, body, emails: targetEmails } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: "Title and body are required." });
        }

        let emails;

        if (Array.isArray(targetEmails) && targetEmails.length > 0) {
            // Send to selected users only
            emails = targetEmails.map((e) => e.toLowerCase().trim()).filter(Boolean);
        } else {
            // Send to all users
            const users = await User.find({}, "email").lean();
            emails = users.map((u) => u.email).filter(Boolean);
        }

        if (emails.length === 0) {
            return res.status(400).json({ error: "No recipients found." });
        }

        // Build the email
        const emailContent = buildCampaignEmail({ title, body });

        // Send emails in batches of 10 to avoid overloading
        const BATCH_SIZE = 10;
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < emails.length; i += BATCH_SIZE) {
            const batch = emails.slice(i, i + BATCH_SIZE);
            const promises = batch.map((email) =>
                sendMail({ to: email, ...emailContent })
                    .then(() => { successCount++; })
                    .catch((err) => {
                        console.error(`[EMAIL CAMPAIGN] Failed to send to ${email}:`, err.message);
                        failCount++;
                    })
            );
            await Promise.all(promises);
        }

        // Log activity
        await logActivity(
            req.admin,
            "SEND_EMAIL_CAMPAIGN",
            "notifications",
            `Sent email campaign "${title}" to ${successCount} users (${failCount} failed)`,
            { title, totalRecipients: emails.length, successCount, failCount },
            req.ip
        );

        res.json({
            message: `Email campaign sent successfully.`,
            totalRecipients: emails.length,
            successCount,
            failCount,
        });
    } catch (error) {
        console.error("[EMAIL CAMPAIGN] Error:", error.message);
        res.status(500).json({ error: "Failed to send email campaign." });
    }
};
