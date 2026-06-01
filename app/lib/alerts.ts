import { query } from './db';

export type AlertType = 'critical' | 'warning' | 'info';
export type AlertSource = 'system' | 'admin' | 'student';

/**
 * Production-ready Alert Creator
 * Assumes schema is handled via migrations.
 */
export async function createAlert(type: AlertType, message: string, source: AlertSource) {
  try {
    // 1. Check system settings for alert preferences
    // If table/row missing, it fails gracefully and continues with insert
    let enabled = true;
    try {
      const prefRes = await query("SELECT value FROM settings WHERE key = 'alert_preferences'");
      if (prefRes.rows.length > 0) {
        const prefs = JSON.parse(prefRes.rows[0].value);
        if (prefs[type] === false) {
          enabled = false;
        }
      }
    } catch (prefError) {
      // If settings table doesn't exist yet, we just assume enabled=true
    }

    if (!enabled) return;

    // 2. Insert alert into the fixed schema
    await query(
      'INSERT INTO alerts (type, message, source) VALUES ($1, $2, $3)',
      [type, message, source]
    );
  } catch (error: any) {
    console.error(`[ALERT ERROR] Failed to create ${type} alert from ${source}:`, error.message);
  }
}
