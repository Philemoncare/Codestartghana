import nodemailer from 'nodemailer';

/**
 * Unified Mail Dispatcher
 * Tries Resend first, forces immediate SMTP fallback on any failure.
 */
async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const fromName = "CodeStart Ghana";
  const fromEmail = "favmoms440@gmail.com";
  // Use MAIL_FROM from env if available, else default
  const fromFull = process.env.MAIL_FROM || `${fromName} <${fromEmail}>`;

  // 1. Try Resend
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_api_key')) {
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
        console.warn(`[MAIL] Resend failed: ${JSON.stringify(err)}. Falling back to SMTP...`);
      }
    } catch (err: any) {
      console.warn(`[MAIL] Resend network error: ${err.message}. Falling back to SMTP...`);
    }
  }

  // 2. SMTP Fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`[MAIL] Attempting SMTP delivery for ${to}...`);

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
      console.log(`[MAIL] Verifying SMTP connection to ${process.env.SMTP_HOST}...`);
      await transporter.verify();
      console.log(`[MAIL] SMTP connection verified. Sending mail...`);

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
      if (error.code === 'EAUTH') {
        console.error('[MAIL] Authentication failed. Check your SMTP_USER and SMTP_PASS (App Password).');
      }
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

export async function sendPasswordResetEmail(to: string, name: string, code: string) {
  const subject = 'CodeStart Security: Password Reset Request';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-flex; align-items: center; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-weight: 900; font-size: 20px; letter-spacing: -0.05em;">CodeStart</div>
      </div>
      <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 8px;">Reset Your Password</h1>
      <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">Hi ${name.split(' ')[0]}, you requested a password reset for your CodeStart student portal account.</p>

      <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px; padding: 32px; margin-bottom: 32px; text-align: center;">
        <p style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Verification Code</p>
        <span style="font-size: 40px; font-weight: 900; letter-spacing: 0.15em; color: #2563eb; font-family: monospace;">${code}</span>
      </div>

      <p style="color: #64748b; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 32px;">This code will expire in 15 minutes. If you did not request this, please secure your account immediately.</p>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px;">CodeStart Ghana &bull; Security Infrastructure</p>
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

export async function sendDetailedOnboardingEmail(to: string, studentData: any) {
  const subject = 'Official Onboarding: CodeStart Ghana 2026 🚀';
  const studentId = `CS26-${studentData.id.toString().padStart(4, '0')}`;
  const communityLink = process.env.WHATSAPP_COMMUNITY_LINK || 'https://chat.whatsapp.com/CodeStartCommunity';

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 650px; margin: 0 auto; background-color: #fcfcfd; border: 1px solid #eef2f6; border-radius: 32px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 48px 40px; text-align: center; color: #ffffff;">
        <div style="font-weight: 900; font-size: 24px; letter-spacing: -0.05em; margin-bottom: 16px;">CODESTART</div>
        <h1 style="font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">Welcome to the Cohort</h1>
        <p style="opacity: 0.7; font-size: 16px; margin-top: 8px;">Your journey into Software Engineering starts now.</p>
      </div>

      <div style="padding: 40px;">
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; padding: 32px; margin-bottom: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Registration Credentials</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Student Identifier</td>
              <td style="padding: 12px 0; color: #2563eb; font-weight: 800; text-align: right; font-family: monospace; font-size: 16px;">${studentId}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Cohort Session</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 700; text-align: right;">January 2026 Cycle</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Registered Name</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 700; text-align: right;">${studentData.full_name}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 32px;">
          <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">CRITICAL NEXT STEPS:</h3>
          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; border-radius: 0 16px 16px 0;">
            <p style="margin: 0 0 12px 0; color: #334155; font-size: 14px; line-height: 1.6;"><strong>1. Secure Your Spot:</strong> If you haven't uploaded your payment screenshot yet, please log in to the portal and do so immediately.</p>
            <p style="margin: 0 0 12px 0; color: #334155; font-size: 14px; line-height: 1.6;"><strong>2. Join the Community:</strong> Connect with fellow builders and instructors.</p>
            <div style="margin-top: 16px;">
              <a href="${communityLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px;">Access Community Group</a>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 32px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">CodeStart Ghana &bull; Practical Engineering Academy</p>
          <p style="color: #94a3b8; font-size: 12px;">This is an automated administrative dispatch.</p>
        </div>
      </div>
    </div>
  `;
  return await sendMail({ to, subject, html });
}
