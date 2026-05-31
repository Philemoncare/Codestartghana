import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

/**
 * Helper to safely query a table and return default if it doesn't exist
 */
async function safeQuery(queryString: string, params: any[] = [], defaultValue: any = []) {
  try {
    const res = await query(queryString, params);
    return res.rows || defaultValue;
  } catch (error: any) {
    // PostgreSQL error code 42P01 is "undefined_table"
    if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
      console.warn(`[DASHBOARD] Table missing during query: ${queryString.substring(0, 50)}...`);
      return defaultValue;
    }
    throw error;
  }
}

export async function GET() {
  const studentEmail = cookies().get('student_email')?.value;

  if (!studentEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get student basic info - Registry table is mandatory
    const res = await query('SELECT * FROM registrations WHERE email = $1', [studentEmail]);

    if (!res || res.rowCount === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = res.rows[0];
    const regId = student.id;

    // 2. Safely get payment status from payments table
    const paymentRows = await safeQuery(
      `SELECT payment_status, transaction_id
       FROM payments
       WHERE registration_id = $1
       ORDER BY CASE WHEN payment_status = 'approved' THEN 1 ELSE 2 END, created_at DESC
       LIMIT 1`,
      [regId],
      [{ payment_status: student.status === 'approved' ? 'approved' : 'pending', transaction_id: null }]
    );

    const paymentInfo = paymentRows[0] || {};
    const isApproved = student.status === 'approved';

    // Basic data available to everyone
    const dashboardData: any = {
      isApproved,
      student: {
        id: regId,
        fullName: student.full_name,
        email: student.email,
        experience: student.experience,
        status: student.status,
        paymentStatus: paymentInfo.payment_status || 'pending',
        transactionId: paymentInfo.transaction_id,
        registrationDate: student.created_at
      }
    };

    // Restricted data for approved students only - FETCH REAL DATA SAFELY
    if (isApproved) {
      // 1. Announcements
      dashboardData.announcements = await safeQuery(
        'SELECT * FROM announcements ORDER BY created_at DESC LIMIT 10',
        [],
        []
      );

      // 2. Schedule
      dashboardData.schedule = await safeQuery(
        'SELECT id, day, time, topic FROM timetable ORDER BY id ASC',
        [],
        []
      );

      // 3. Calculate REAL learning progress safely
      try {
        const totalModules = await safeQuery('SELECT COUNT(*) FROM modules WHERE is_published = TRUE', [], [{ count: '0' }]);
        const completedModules = await safeQuery(
          "SELECT COUNT(*) FROM student_progress WHERE registration_id = $1 AND status = 'completed'",
          [regId],
          [{ count: '0' }]
        );

        const totalCount = parseInt(totalModules[0].count || '0');
        const completedCount = parseInt(completedModules[0].count || '0');

        const currentModule = await safeQuery(
          `SELECT m.title
           FROM modules m
           JOIN student_progress sp ON m.id = sp.module_id
           WHERE sp.registration_id = $1 AND sp.status = 'in_progress'
           LIMIT 1`,
          [regId],
          []
        );

        dashboardData.progress = {
          percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
          completedModules: completedCount,
          totalModules: totalCount,
          currentModule: currentModule[0]?.title || 'Not Started',
        };
      } catch (e) {
        dashboardData.progress = { percentage: 0, completedModules: 0, totalModules: 0, currentModule: 'Not Started' };
      }

      // 4. Projects
      dashboardData.projects = await safeQuery(
        'SELECT * FROM student_projects WHERE registration_id = $1 ORDER BY submitted_at DESC',
        [regId],
        []
      );

      // 5. Attendance metrics
      const attendance = await safeQuery(
        `SELECT a.*, t.topic, t.day, t.time
         FROM attendance a
         JOIN timetable t ON a.timetable_id = t.id
         WHERE a.registration_id = $1
         ORDER BY a.attended_at DESC`,
        [regId],
        []
      );
      dashboardData.attendanceCount = attendance.length;
      dashboardData.attendanceHistory = attendance;

      // 6. Badges
      dashboardData.badges = await safeQuery(
        'SELECT * FROM student_badges WHERE registration_id = $1 ORDER BY earned_at DESC',
        [regId],
        []
      );

      dashboardData.resources = [];
    }

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error('STUDENT DASHBOARD ERROR:', error);
    return NextResponse.json({
      error: 'Internal system error',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
