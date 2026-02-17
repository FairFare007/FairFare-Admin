import axios from "axios";

/**
 * Generic reusable mail function using the Vercel mail relay.
 * @param {{ to: string, subject: string, html?: string, text?: string }} options
 */
export async function sendMail({ to, subject, html, text }) {
    const MAIL_SERVICE_URL = process.env.MAIL_SERVICE_URL;
    const MAIL_SERVICE_PASSWORD = process.env.MAIL_SERVICE_PASSWORD;

    if (!MAIL_SERVICE_URL || !MAIL_SERVICE_PASSWORD) {
        console.error("[MAIL] Mail service env vars missing: MAIL_SERVICE_URL or MAIL_SERVICE_PASSWORD");
        return;
    }

    if (!to || !subject || (!html && !text)) {
        console.error("[MAIL] sendMail called with missing fields");
        return;
    }

    try {
        await axios.post(
            MAIL_SERVICE_URL,
            { to, subject, html, text },
            {
                headers: {
                    "x-mail-password": MAIL_SERVICE_PASSWORD,
                },
                timeout: 10_000,
            }
        );
        console.log(`[MAIL] Email sent successfully to ${to}`);
    } catch (err) {
        console.error("[MAIL] Error calling mail service:", err.response?.data || err.message);
    }
}
