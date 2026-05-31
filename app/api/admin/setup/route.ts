import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

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
