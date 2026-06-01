import { query } from './db';

export type AlertType = 'critical' | 'warning' | 'info' | 'success';
export type AlertSource = 'system' | 'admin' | 'student';
export type AlertCategory = 'system' | 'registration' | 'payment' | 'student' | 'security' | 'delivery';

/**
 * Production-ready Alert Creator
 */
export async function createAlert(
  type: AlertType,
  message: string,
  source: AlertSource = 'system',
  title?: string,
  category: AlertCategory = 'system'
) {
  try {
    // 1. Check system settings for alert preferences
    let enabled = true;
    try {
      const prefRes = await query("SELECT value FROM settings WHERE key = 'alert_preferences'");
      if (prefRes.rows.length > 0) {
        const prefs = JSON.parse(prefRes.rows[0].value);
        if (prefs[type] === false) {
          enabled = false;
        }
      }
    } catch (prefError) {}

    if (!enabled) return;

    // 2. Insert alert into the fixed schema
    await query(
      'INSERT INTO alerts (type, title, message, source, category) VALUES ($1, $2, $3, $4, $5)',
      [type, title || message.substring(0, 50), message, source, category]
    );
  } catch (error: any) {
    console.error(`[ALERT ERROR] Failed to create ${type} alert from ${source}:`, error.message);
  }
}
