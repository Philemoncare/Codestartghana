import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { createAlert } from '@/lib/alerts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Check if admin is authorized
    await verifyAdmin();

    console.log('[SETUP] Starting database migration...');

    // 2. Comprehensive Table Update for registrations
    await query(`
      ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS password_hash TEXT,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS approval_email_sent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS approval_email_sent_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS profile_photo_url TEXT
    `);

    // 2.5 Support for email reuse after rejection
    // Remove ALL unique constraints on the email column to allow partial index to work
    await query(`
      DO $$
      DECLARE
          r record;
      BEGIN
          FOR r IN (
              SELECT conname
              FROM pg_constraint
              WHERE conrelid = 'registrations'::regclass
                AND contype = 'u'
          ) LOOP
              EXECUTE 'ALTER TABLE registrations DROP CONSTRAINT ' || quote_ident(r.conname);
          END LOOP;
      END $$;
    `);

    // Ensure we also drop any unique indexes that aren't constraints
    await query(`DROP INDEX IF EXISTS registrations_email_key`);

    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_active_email
      ON registrations (email)
      WHERE (status != 'rejected')
    `);

    // 3. Ensure payments table is correct
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id),
        student_name TEXT NOT NULL,
        transaction_id TEXT NOT NULL UNIQUE,
        sender_number TEXT NOT NULL,
        screenshot_url TEXT NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'pending',
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Ensure admins table has what it needs
    await query(`
      ALTER TABLE admins
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin'
    `);

    // 5. Ensure verification_codes table exists for 2FA
    await query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(id),
        code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Ensure timetable table exists
    await query(`
      CREATE TABLE IF NOT EXISTS timetable (
        id SERIAL PRIMARY KEY,
        day VARCHAR(20) NOT NULL,
        time VARCHAR(100) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure description column exists if table was already created
    await query(`
      ALTER TABLE timetable
      ADD COLUMN IF NOT EXISTS description TEXT
    `);

    // 7. NEW: Announcements table
    await query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'general',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. NEW: Modules table
    await query(`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        is_published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. NEW: Student Progress table
    await query(`
      CREATE TABLE IF NOT EXISTS student_progress (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'not_started',
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(registration_id, module_id)
      )
    `);

    // 10. NEW: Student Projects table
    await query(`
      CREATE TABLE IF NOT EXISTS student_projects (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        project_url TEXT,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 11. NEW: Attendance Tracking
    await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        timetable_id INTEGER REFERENCES timetable(id) ON DELETE CASCADE,
        attended_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. NEW: Student Badges / Achievements
    await query(`
      CREATE TABLE IF NOT EXISTS student_badges (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        badge_name VARCHAR(100) NOT NULL,
        badge_type VARCHAR(50),
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 13. NEW: System Settings (for things like Timetable Image)
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 14. NEW: Password Reset Table
    await query(`
      CREATE TABLE IF NOT EXISTS student_password_resets (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 15. NEW: Activity Logs (for security auditing)
    await query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 16. ENHANCED: System Alerts & Notifications Center
    await query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL DEFAULT 'info',
        title VARCHAR(255),
        message TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'system',
        source VARCHAR(50) DEFAULT 'system',
        is_read BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns to alerts if it already existed
    await query(`
      ALTER TABLE alerts
      ADD COLUMN IF NOT EXISTS title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'system',
      ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE
    `);

    // Update existing check constraint for type if needed (Postgres doesn't easily allow updating CHECK, so we might drop and recreate)
    await query(`
      ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_type_check;
      ALTER TABLE alerts ADD CONSTRAINT alerts_type_check CHECK (type IN ('critical', 'warning', 'info', 'success'));
    `);

    // 17. NEW: SMS Logs (Termii tracking)
    await query(`
      CREATE TABLE IF NOT EXISTS sms_logs (
        id SERIAL PRIMARY KEY,
        student_name VARCHAR(255),
        phone_number VARCHAR(50) NOT NULL,
        message_body TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'sent',
        provider_response TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if timetable is empty and seed if necessary
    const timetableCheck = await query('SELECT COUNT(*) FROM timetable');
    if (parseInt(timetableCheck.rows[0].count) === 0) {
      await query(`
        INSERT INTO timetable (day, time, topic) VALUES
        ('Monday', '1:00 PM - 3:00 PM', 'HTML5 & Semantic Web'),
        ('Wednesday', '1:00 PM - 3:00 PM', 'Modern CSS & Flexbox'),
        ('Friday', '1:00 PM - 3:00 PM', 'JavaScript Fundamentals')
      `);
    }

    console.log('[SETUP] Migration successful.');

    await createAlert('info', 'System routine action: Database migration and setup run successfully.', 'system', 'Database Migration', 'system');

    return NextResponse.json({
      success: true,
      message: 'Database schema updated successfully.'
    });
  } catch (error: any) {
    console.error('[SETUP] Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
