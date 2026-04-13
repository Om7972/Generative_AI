const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

/**
 * Notification Service — centralized email + push notification handler
 */

// Transporter — configure with real SMTP in production
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "dummy_user@ethereal.email",
    pass: process.env.SMTP_PASS || "dummy_pass",
  },
});

/**
 * Send an email notification
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} body - email body text
 */
async function sendEmail(to, subject, body) {
  try {
    // In development without real SMTP, log the email instead of sending
    if (process.env.NODE_ENV !== "production") {
      logger.info(`[EMAIL MOCK] To: ${to} | Subject: ${subject} | Body: ${body}`);
      return { success: true, mock: true };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"MediGuide AI" <noreply@mediguide.ai>',
      to,
      subject,
      text: body,
      html: `
        <div style="font-family: -apple-system, Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #6366f1, #3b82f6); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💊 MediGuide AI</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">${subject}</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 14px;">${body}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              This is an automated notification from MediGuide AI. Please do not reply.
            </p>
          </div>
        </div>
      `,
    });

    logger.info(`[EMAIL] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`[EMAIL ERROR] Failed to send to ${to}: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Send emergency alert email
 */
async function sendEmergencyAlert(to, alertData) {
  const subject = "🚨 EMERGENCY: MediGuide Critical Health Alert";
  const body = `CRITICAL ALERT: ${alertData.title}\n\n${alertData.message}\n\nAction Required: ${alertData.actionRequired ? "YES — Contact your healthcare provider immediately." : "Monitor closely."}`;
  return await sendEmail(to, subject, body);
}

module.exports = { sendEmail, sendEmergencyAlert };
