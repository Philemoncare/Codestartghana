import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await verifyAdmin();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status'); // 'read', 'unread'

    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params: any[] = [];

    if (type) {
      params.push(type);
      sql += ` AND type = $${params.length}`;
    }

    if (status === 'unread') {
      sql += ' AND is_read = FALSE';
    } else if (status === 'read') {
      sql += ' AND is_read = TRUE';
    }

    sql += ' ORDER BY created_at DESC';

    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('[FETCH ALERTS ERROR]:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { action } = await req.json();

    if (action === 'mark_all_read') {
      await query('UPDATE alerts SET is_read = TRUE WHERE is_read = FALSE');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[UPDATE ALERTS ERROR]:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await verifyAdmin();
    const { action } = await req.json();

    if (action === 'clear_all') {
      await query('DELETE FROM alerts');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[DELETE ALERTS ERROR]:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
