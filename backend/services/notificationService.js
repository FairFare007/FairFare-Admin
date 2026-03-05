import admin from "../firebaseAdmin.js";

/**
 * Send a push notification to a single FCM token.
 */
const sendToOne = async (token, title, body) => {
    const payload = {
        token,
        data: {
            title,
            body,
            url: "https://fair-fare-phi.vercel.app",
        },
    };

    try {
        const res = await admin.messaging().send(payload);
        console.log("[NOTIFICATION] Sent successfully to token");
        return res;
    } catch (error) {
        console.error("[NOTIFICATION] Error sending to token:", error.message);
        throw error;
    }
};

/**
 * Send push notifications to multiple FCM tokens at once.
 */
const sendToMultiple = async (tokens, title, body) => {
    if (!Array.isArray(tokens) || tokens.length === 0) {
        throw new Error("Tokens array must not be empty");
    }

    const payload = {
        data: {
            title,
            body,
            url: "https://fair-fare-phi.vercel.app",
        },
        tokens,
    };

    try {
        const res = await admin.messaging().sendEachForMulticast(payload);
        console.log(`[NOTIFICATION] Sent: ${res.successCount} success, ${res.failureCount} failed`);
        if (res.responses.some((r) => !r.success)) {
            const failedTokens = res.responses
                .map((r, i) => (!r.success ? tokens[i] : null))
                .filter(Boolean);
            console.log("[NOTIFICATION] Failed tokens:", failedTokens.length);
        }
        return res;
    } catch (error) {
        console.error("[NOTIFICATION] Error sending to multiple:", error.message);
        throw error;
    }
};

export default { sendToOne, sendToMultiple };
