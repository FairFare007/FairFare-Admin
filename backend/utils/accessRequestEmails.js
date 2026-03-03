/**
 * Email templates for access request approval and rejection.
 * Uses the FairFare dark theme consistent with dailyEmailReport.js styling.
 */

/**
 * Build a warm welcome email for approved access requests.
 */
export function buildApprovalEmail({ name, email, tempPassword }) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FairFare Admin</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a;">
            <tr>
                <td align="center" style="padding: 32px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 8px 16px 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 32px 24px; text-align: center;">
                                            <div style="font-size: 42px; margin-bottom: 8px;">🎉</div>
                                            <div style="font-size: 26px; font-weight: 800; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif;">
                                                Welcome to the Team!
                                            </div>
                                            <div style="font-size: 15px; color: rgba(255,255,255,0.9); margin-top: 8px; font-family: 'Segoe UI', Arial, sans-serif;">
                                                Your admin access has been approved
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Welcome Message -->
                        <tr>
                            <td style="padding: 0 16px 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 12px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 24px;">
                                            <div style="font-size: 18px; font-weight: 700; color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; margin-bottom: 12px;">
                                                Hey ${name}! 👋
                                            </div>
                                            <div style="font-size: 14px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7;">
                                                We're absolutely thrilled to have you on board! Your request to join the FairFare admin team has been <strong style="color: #10b981;">approved</strong>.
                                            </div>
                                            <div style="font-size: 14px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; margin-top: 12px;">
                                                You're now part of the crew that keeps FairFare running smoothly for thousands of users. Together, we'll build, maintain, and improve a product that genuinely makes people's lives easier. We're so glad you're here to collaborate with us on this journey! 🚀
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Credentials Card -->
                        <tr>
                            <td style="padding: 0 16px 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid rgba(16, 185, 129, 0.2);">
                                    <tr>
                                        <td style="padding: 24px;">
                                            <div style="font-size: 14px; font-weight: 700; color: #10b981; font-family: 'Segoe UI', Arial, sans-serif; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">
                                                🔐 Your Login Credentials
                                            </div>
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="font-size: 13px; color: #64748b; font-family: 'Segoe UI', Arial, sans-serif;">Email</span>
                                                        <div style="font-size: 15px; color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; font-weight: 600; margin-top: 4px;">
                                                            ${email}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="font-size: 13px; color: #64748b; font-family: 'Segoe UI', Arial, sans-serif;">Temporary Password</span>
                                                        <div style="font-size: 15px; color: #fbbf24; font-family: 'Courier New', monospace; font-weight: 700; margin-top: 4px; background: rgba(251, 191, 36, 0.1); display: inline-block; padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.2);">
                                                            ${tempPassword}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Important Note -->
                        <tr>
                            <td style="padding: 0 16px 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(251, 191, 36, 0.08); border-radius: 12px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.15);">
                                    <tr>
                                        <td style="padding: 20px 24px;">
                                            <div style="font-size: 14px; font-weight: 700; color: #fbbf24; font-family: 'Segoe UI', Arial, sans-serif; margin-bottom: 8px;">
                                                ⚠️ Important: Change Your Password
                                            </div>
                                            <div style="font-size: 13px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6;">
                                                For security, you will be asked to set a new password when you log in for the first time. Please choose a strong password that you don't use elsewhere.
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 16px 16px 8px; text-align: center;">
                                <div style="font-size: 12px; color: #475569; font-family: 'Segoe UI', Arial, sans-serif;">
                                    Welcome aboard! We can't wait to see the impact you'll make.
                                </div>
                                <div style="font-size: 12px; color: #334155; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 4px;">
                                    FairFare Admin Team 💚
                                </div>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;

    const text = `Welcome to the FairFare Admin Team, ${name}!\n\nYour admin access request has been approved! 🎉\n\nYour login credentials:\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nIMPORTANT: You will be asked to change your password on first login. Please choose a strong password.\n\nWelcome aboard!\n— FairFare Admin Team`;

    return { html, text, subject: `🎉 Welcome to FairFare Admin, ${name}!` };
}

/**
 * Build a polite rejection email for denied access requests.
 */
export function buildRejectionEmail({ name, email }) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FairFare Admin — Access Request Update</title>
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
                                            <div style="font-size: 26px; font-weight: 800; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif;">
                                                FairFare Admin
                                            </div>
                                            <div style="font-size: 15px; color: rgba(255,255,255,0.85); margin-top: 8px; font-family: 'Segoe UI', Arial, sans-serif;">
                                                Access Request Update
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Message -->
                        <tr>
                            <td style="padding: 0 16px 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 12px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 24px;">
                                            <div style="font-size: 18px; font-weight: 700; color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; margin-bottom: 12px;">
                                                Hi ${name},
                                            </div>
                                            <div style="font-size: 14px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7;">
                                                Thank you for your interest in joining the FairFare admin team. After careful review, we regret to inform you that we are <strong style="color: #f87171;">unable to approve</strong> your request for admin access at this time.
                                            </div>
                                            <div style="font-size: 14px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; margin-top: 12px;">
                                                This does not necessarily reflect on you personally — there could be various reasons for this decision, and we appreciate your understanding.
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Next Steps -->
                        <tr>
                            <td style="padding: 0 16px 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 12px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 24px;">
                                            <div style="font-size: 14px; font-weight: 700; color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; margin-bottom: 12px;">
                                                📋 What You Should Know
                                            </div>
                                            <div style="font-size: 14px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7;">
                                                If you believe this decision was made in error, or if you have a legitimate need for admin access, please <strong style="color: #818cf8;">contact a member of our admin team directly</strong> before submitting another request.
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Warning -->
                        <tr>
                            <td style="padding: 0 16px 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(239, 68, 68, 0.08); border-radius: 12px; overflow: hidden; border: 1px solid rgba(239, 68, 68, 0.15);">
                                    <tr>
                                        <td style="padding: 20px 24px;">
                                            <div style="font-size: 14px; font-weight: 700; color: #f87171; font-family: 'Segoe UI', Arial, sans-serif; margin-bottom: 8px;">
                                                ⚠️ Important Notice
                                            </div>
                                            <div style="font-size: 13px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6;">
                                                Submitting multiple access requests without prior approval from an existing admin may result in your email being <strong style="color: #f87171;">permanently blacklisted</strong> from future requests. This could also lead to further action as deemed necessary by the admin team. Please reach out to an admin before reapplying.
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 16px 16px 8px; text-align: center;">
                                <div style="font-size: 12px; color: #475569; font-family: 'Segoe UI', Arial, sans-serif;">
                                    We appreciate your understanding.
                                </div>
                                <div style="font-size: 12px; color: #334155; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 4px;">
                                    FairFare Admin Team
                                </div>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;

    const text = `Hi ${name},\n\nThank you for your interest in joining the FairFare admin team. After careful review, we are unable to approve your request for admin access at this time.\n\nIf you believe this was an error, please contact a member of our admin team directly before submitting another request.\n\nIMPORTANT: Submitting multiple requests without prior approval from an existing admin may result in your email being permanently blacklisted and could lead to serious consequences.\n\n— FairFare Admin Team`;

    return { html, text, subject: `FairFare Admin — Access Request Update` };
}
