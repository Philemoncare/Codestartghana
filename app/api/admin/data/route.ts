import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await verifyAdmin();
    const regRes = await query('SELECT COUNT(*) FROM registrations');
    const totalApps = parseInt(regRes.rows?.[0]?.count || '0');

    // 2. Get verified students (those with an approved payment)
    const approvedPayRes = await query("SELECT COUNT(DISTINCT registration_id) FROM payments WHERE payment_status = 'approved'");
    const approvedCount = parseInt(approvedPayRes.rows?.[0]?.count || '0');

    // 3. Get pending payments
    const pendingPayRes = await query("SELECT COUNT(*) FROM payments WHERE payment_status = 'pending'");
    const pendingCount = parseInt(pendingPayRes.rows?.[0]?.count || '0');

    // 4. Get recent payments with email tracking
    const recentPaymentsRes = await query(`
      SELECT p.*, r.approval_email_sent, r.approval_email_sent_at
      FROM payments p
      LEFT JOIN registrations r ON p.registration_id = r.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    const stats = {
      totalApplications: totalApps,
      pendingPayments: pendingCount,
      approvedStudents: approvedCount,
      totalRevenue: approvedCount * 450
    };

    return NextResponse.json({
      stats,
      payments: recentPaymentsRes.rows || []
    });
  } catch (error: any) {
    console.error('CRITICAL DASHBOARD DATA ERROR:', error);
    // Return empty but valid structure to prevent frontend crash
    return NextResponse.json({
      stats: { totalApplications: 0, pendingPayments: 0, approvedStudents: 0, totalRevenue: 0 },
      payments: [],
      error: 'Database connection or query failed'
    }, { status: 200 }); // Return 200 so apiFetch doesn't throw, but UI can show error state if needed
  }
}

// SECURE ONE-TIME CLEANUP HANDLER
export async function POST() {
  try {
    await verifyAdmin();
    console.log('[SYSTEM] Initiating full data purge...');

    // Ordered to respect foreign key constraints
    await query('TRUNCATE TABLE payments CASCADE');
    await query('TRUNCATE TABLE registrations RESTART IDENTITY CASCADE');
    await query('TRUNCATE TABLE verification_codes RESTART IDENTITY CASCADE');

    console.log('[SYSTEM] Database records successfully deleted.');
    return NextResponse.json({ success: true, message: 'All registry and payment data has been cleared.' });
  } catch (error: any) {
    console.error('[SYSTEM] Data purge failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
