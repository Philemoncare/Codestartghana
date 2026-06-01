import { query } from './db';
import { createAlert } from './alerts';

/**
 * Normalizes phone numbers to international format (233XXXXXXXXX)
 * Removes non-numeric characters and ensures it starts with country code.
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // If it starts with 0 and is 10 digits (Standard Ghana format 024XXXXXXX)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '233' + cleaned.substring(1);
  }

  // If it starts with +233, remove the +
  if (phone.startsWith('+233')) {
    cleaned = '233' + phone.substring(4).replace(/\D/g, '');
  }

  return cleaned;
}

/**
 * Termii SMS Dispatcher with Automatic Retry
 */
export async function sendSMS(to: string, message: string, studentName?: string, retryCount = 1) {
  const normalizedNumber = normalizePhoneNumber(to);
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || 'CodeStart';
  const baseUrl = process.env.TERMII_BASE_URL || 'https://v3.api.termii.com';

  try {
    if (!apiKey || apiKey === 'your_actual_termii_api_key_here') {
      throw new Error('TERMII_API_KEY is not configured. Please add your real API key to .env.local');
    }

    console.log(`[SMS] Attempting to send message via Termii to ${normalizedNumber}...`);

    const payload = {
      api_key: apiKey,
      to: normalizedNumber,
      from: senderId,
      sms: message,
      type: 'plain',
      channel: 'generic'
    };

    const response = await fetch(`${baseUrl}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    // Termii success check
    const success = response.ok && (result.code === 'ok' || result.message?.toLowerCase().includes('success') || result.status?.toLowerCase().includes('success'));

    if (!success && retryCount > 0) {
      console.warn(`[SMS] Send failed, retrying... (${retryCount} attempts left)`);
      return await sendSMS(to, message, studentName, retryCount - 1);
    }

    const statusText = success ? 'sent' : 'failed';

    // Log to sms_logs (Fixed Schema)
    try {
      await query(
        `INSERT INTO sms_logs (student_name, phone_number, message_body, status, provider_response)
         VALUES ($1, $2, $3, $4, $5)`,
        [studentName || 'N/A', normalizedNumber, message, statusText, JSON.stringify(result)]
      );
    } catch (dbError: any) {
      console.error('[SMS LOG ERROR] Failed to write to sms_logs table:', dbError.message);
      // Fail gracefully - don't block the main flow
    }

    if (!success) {
      throw new Error(result.message || 'Termii API returned an error');
    }

    console.log(`[SMS] Message sent successfully to ${normalizedNumber}`);
    return { success: true, data: result };

  } catch (error: any) {
    console.error(`[SMS] FAILED to send to ${normalizedNumber}:`, error.message);

    // Log final failure in system alerts if all retries exhausted
    if (retryCount === 0) {
      await createAlert('critical', `SMS Delivery Failed: ${normalizedNumber}. Error: ${error.message}`, 'system');

      // Attempt final log entry for the failure
      try {
        await query(
          `INSERT INTO sms_logs (student_name, phone_number, message_body, status, provider_response)
           VALUES ($1, $2, $3, $4, $5)`,
          [studentName || 'N/A', normalizedNumber, message, 'failed', error.message]
        );
      } catch (e) {
        console.error('[SMS LOG ERROR] Final failure log failed:', e);
      }
    } else {
      // If error occurred before/during fetch and we have retries left
      return await sendSMS(to, message, studentName, retryCount - 1);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Specifically for registration confirmation
 */
export async function sendRegistrationConfirmationSMS(to: string, studentName?: string) {
  const message = "CodeStart Ghana: Thank you for registering. Your application has been received and is currently under review. Please check your email for updates and onboarding instructions.";
  return await sendSMS(to, message, studentName);
}
