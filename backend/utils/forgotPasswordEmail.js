/**
 * Email template for temporary password reset.
 */
export function buildForgotPasswordEmail({ name, tempPassword }) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FairFare Admin — Password Reset</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a;">
            <tr>
                <td align="center" style="padding: 32px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">

                        <!-- Header -->
                        <tr>
                            <td style="padding: 8px 16px 24px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 16px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 32px 24px; text-align: center;">
                                            <div style="font-size: 42px; margin-bottom: 8px;">🔑</div>
                                            <div style="font-size: 26px; font-weight: 800; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif;">
                                                Password Reset
                                            </div>
                                            <div style="font-size: 15px; color: rgba(255,255,255,0.9); margin-top: 8px; font-family: 'Segoe UI', Arial, sans-serif;">
                                                Temporary access for ${name}
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
                                            <div style="font-size: 14px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7;">
                                                We received a request to reset your FairFare Admin password. Use the temporary password below to log in.
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Password Card -->
                        <tr>
                            <td style="padding: 0 16px 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid rgba(245, 158, 11, 0.2);">
                                    <tr>
                                        <td style="padding: 24px; text-align: center;">
                                            <div style="font-size: 13px; color: #64748b; font-family: 'Segoe UI', Arial, sans-serif; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                                Temporary Password
                                            </div>
                                            <div style="font-size: 24px; color: #f59e0b; font-family: 'Courier New', monospace; font-weight: 700; background: rgba(245, 158, 11, 0.1); display: inline-block; padding: 12px 24px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.2); letter-spacing: 2px;">
                                                ${tempPassword}
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Security Notice -->
                        <tr>
                            <td style="padding: 0 16px 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(239, 68, 68, 0.08); border-radius: 12px; overflow: hidden; border: 1px solid rgba(239, 68, 68, 0.15);">
                                    <tr>
                                        <td style="padding: 20px 24px;">
                                            <div style="font-size: 14px; font-weight: 700; color: #f87171; font-family: 'Segoe UI', Arial, sans-serif; margin-bottom: 8px;">
                                                🛡️ Security Alert
                                            </div>
                                            <div style="font-size: 13px; color: #94a3b8; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6;">
                                                For your protection, you will be required to change this password immediately after logging in. If you didn't request this reset, please contact a superadmin at once.
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
                                    FairFare Admin Security Team
                                </div>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;

    const text = `Hi ${name},\n\nYou requested a password reset for FairFare Admin.\n\nTemporary Password: ${tempPassword}\n\nIMPORTANT: You will be required to change this password upon login. If you didn't request this, contact a superadmin.\n\n— FairFare Admin Team`;

    return { html, text, subject: `FairFare Admin — Temporary Password` };
}
