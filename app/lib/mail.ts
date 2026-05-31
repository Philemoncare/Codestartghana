import nodemailer from 'nodemailer';

/**
 * Unified Mail Dispatcher
 * Tries Resend first, forces immediate SMTP fallback on any failure.
 */
async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const fromName = "CodeStart Ghana";
  const fromEmail = "codestartghana@gmail.com";
  // Use MAIL_FROM from env if available, else default
  const fromFull = process.env.MAIL_FROM || `${fromName} <${fromEmail}>`;

  // 1. Try Resend
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`[MAIL] Trying Resend to ${to}...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        },
        body: JSON.stringify({
          from: fromFull,
          to: to,
          subject,
          html,
        }),
      });

      if (res.ok) {
        console.log(`[MAIL] Resend email sent successfully to ${to}`);
        return { success: true, provider: 'resend' };
      } else {
        const err = await res.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.warn(`[MAIL] Resend failed: ${JSON.stringify(err)}. Falling back...`);
      }
    } catch (err: any) {
      console.warn(`[MAIL] Resend network error: ${err.message}. Falling back...`);
    }
  }

  // 2. SMTP Fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`[MAIL] Falling back to SMTP for ${to}...`);

    const smtpConfig: any = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      }
    };

    // Special handling for Gmail
    if (process.env.SMTP_HOST.includes('gmail.com')) {
      delete smtpConfig.host;
      delete smtpConfig.port;
      delete smtpConfig.secure;
      smtpConfig.service = 'gmail';
    }

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
      // Verify connection before sending
      await transporter.verify();

      const info = await transporter.sendMail({
        from: fromFull,
        to,
        subject,
        html,
      });
      console.log(`[MAIL] SMTP email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return { success: true, provider: 'smtp' };
    } catch (error: any) {
      console.error(`[MAIL] SMTP ERROR for ${to}:`, error.message);
      return { success: false, error: error.message || 'SMTP delivery failed' };
    }
  }

  console.error('[MAIL] CRITICAL: No mail providers available or configured.');
  return { success: false, error: 'No mail providers configured' };
}

export async function sendVerificationEmail(to: string, code: string) {
  const subject = 'CodeStart Admin Verification';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
      <h2 style="color: #1e293b; font-weight: 800; letter-spacing: -0.025em;">Security Verification</h2>
      <p style="color: #64748b; font-size: 16px; line-height: 1.6;">A login attempt was made for the CodeStart administrative panel. Use the verification code below to complete the process.</p>
      <div style="background-color: #f8fafc; padding: 32px; border-radius: 12px; text-align: center; margin: 32px 0;">
        <span style="font-size: 32px; font-weight: 900; letter-spacing: 0.2em; color: #2563eb;">${code}</span>
      </div>
      <p style="color: #94a3b8; font-size: 12px;">This code will expire in 10 minutes. If you did not request this login, please ignore this email.</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
        <p style="color: #475569; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">CodeStart Administrative System &copy; 2026</p>
      </div>
    </div>
  `;
  return await sendMail({ to, subject, html });
}

export async function sendApprovalEmail(to: string, name: string) {
  const subject = 'Welcome to CodeStart Ghana 🚀';
  const whatsappLink = process.env.WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/F6F93vrKMyNK2GVGl8QXfB';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px;">
      <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 24px;">Hello ${name.split(' ')[0]},</h1>
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Congratulations! Your enrollment into CodeStart Ghana has been approved successfully.</p>
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">You can now join the official student WhatsApp group using the link below:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${whatsappLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-decoration: none;">Join WhatsApp Group</a>
      </div>
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
        <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; margin-top: 0;">Important:</h3>
        <ul style="color: #475569; font-size: 14px; margin-bottom: 0;">
          <li>Keep notifications on</li>
          <li>Introduce yourself after joining</li>
          <li>Training updates will be shared there</li>
        </ul>
      </div>
      <p style="color: #64748b; font-size: 16px; margin-bottom: 8px;">We’re excited to have you onboard.</p>
      <p style="color: #0f172a; font-weight: 700;">— CodeStart Ghana</p>
      <p style="color: #94a3b8; font-size: 12px;">Takoradi, Ghana</p>
    </div>
  `;

  return await sendMail({ to, subject, html });
}

export const sendWelcomeEmail = sendApprovalEmail;

export async function sendRegistrationReceivedEmail(to: string, name: string) {
  const subject = 'Application Received: CodeStart Ghana 🚀';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-flex; align-items: center; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-weight: 900; font-size: 20px; letter-spacing: -0.05em;">CodeStart</div>
      </div>
      <h1 style="color: #0f172a; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; text-align: center; margin-bottom: 8px;">Application Received!</h1>
      <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">Hi ${name.split(' ')[0]}, thank you for applying to the 2026 CodeStart Ghana Cohort. We have received your details.</p>
      <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 20px; padding: 32px; margin-bottom: 32px; text-align: center;">
        <h3 style="color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 16px;">What's Next?</h3>
        <p style="color: #334155; font-size: 15px; line-height: 1.8;">Our team will review your application. If you haven't completed your registration fee payment yet, please ensure you do so to secure your spot.</p>
      </div>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">CodeStart Ghana &copy; 2026</p>
      </div>
    </div>
  `;
  return await sendMail({ to, subject, html });
}
