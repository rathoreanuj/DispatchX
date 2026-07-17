import nodemailer from "nodemailer";
import { Resend } from "resend";

let transporter = null;
let resendClient = null;

export const initEmailTransporter = async () => {
  // 1. Check for Resend API Key (Delivers to real inboxes)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "") {
    resendClient = new Resend(process.env.RESEND_API_KEY.trim());
    console.log("🚀 Resend Email Service initialized! Delivering to REAL inboxes.");
    return;
  }

  // 2. Check for custom SMTP (Resend SMTP, SendGrid, Amazon SES, Gmail, etc.)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isSecure = Number(process.env.SMTP_PORT) === 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: isSecure,
      pool: true, // Reuse persistent SMTP socket connections
      maxConnections: 10,
      maxMessages: 100,
      connectionTimeout: 8000,
      socketTimeout: 8000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`✉️ Pooled SMTP Transport initialized: ${process.env.SMTP_USER} via ${process.env.SMTP_HOST || 'smtp.ethereal.email'}`);
  } else {
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    console.log("✉️ Nodemailer initialized with fallback JSON transport.");
  }
};

export const sendEmail = async ({ to, from, subject, body }) => {
  if (!resendClient && !transporter) {
    await initEmailTransporter();
  }

  const emailHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 28px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 10px; background: #ffffff;">
    <div style="font-weight: 800; font-size: 17px; color: #ea580c; margin-bottom: 18px; letter-spacing: -0.3px;">DispatchX</div>
    <h2 style="color: #0a0a0a; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3;">${subject}</h2>
    <div style="font-size: 15px; line-height: 1.7; color: #262626; white-space: pre-line;">${body}</div>
    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 28px 0 16px;" />
    <p style="font-size: 11px; color: #737373; margin: 0; font-family: monospace;">Dispatched via DispatchX Distributed Infrastructure • Guaranteed Delivery</p>
  </div>`;

  // --- Path A: Resend API Dispatch (Delivers to Real Inboxes) ---
  if (resendClient) {
    const configuredFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";
    // Prefer custom sender if specified, otherwise fall back to EMAIL_FROM
    let sender = configuredFrom;
    if (from && from.trim() !== "" && from.includes("@") && !from.includes("ethereal.email") && !from.includes("dispatch.internal")) {
      sender = from;
    }

    const recipients = Array.isArray(to) ? to : [to];

    const { data, error } = await resendClient.emails.send({
      from: sender,
      to: recipients,
      subject,
      text: body,
      html: emailHtml,
    });

    if (error) {
      console.error(`❌ [Resend Delivery Failed] to ${to}:`, error);
      throw new Error(`Resend Error: ${error.message || JSON.stringify(error)}`);
    }

    console.log(`⚡ [Real Inbox Delivered via Resend] From: "${sender}" | To: ${to} | ID: ${data?.id} | Subject: "${subject}"`);
    return { messageId: data?.id, ...data };
  }

  // --- Path B: SMTP Transport (Custom SMTP or Ethereal test inbox) ---
  const defaultSmtpFrom = process.env.EMAIL_FROM || process.env.SMTP_USER || "jamel27@ethereal.email";
  const smtpSender = (from && !from.includes("ethereal.email") && !from.includes("dispatch.internal"))
    ? from
    : defaultSmtpFrom;

  const mailOptions = {
    from: smtpSender,
    to,
    subject,
    text: body,
    html: emailHtml
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`⚡ [SMTP Delivered] To: ${to} | Subject: "${subject}"`);
  
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`🔗 Ethereal Test Inbox Preview: ${previewUrl}`);
  }

  return info;
};
