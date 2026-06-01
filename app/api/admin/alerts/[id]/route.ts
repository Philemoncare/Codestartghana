import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdmin();
    const data = await req.json();

    const allowedUpdates = ['is_read', 'is_archived'];
    const updates: string[] = [];
    const values: any[] = [];

    allowedUpdates.forEach((field) => {
      if (data[field] !== undefined) {
        values.push(data[field]);
        updates.push(`${field} = $${values.length}`);
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(params.id);
    const sql = `UPDATE alerts SET ${updates.join(', ')} WHERE id = $${values.length}`;

    await query(sql, values);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Alert Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdmin();
    await query('DELETE FROM alerts WHERE id = $1', [params.id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Alert Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
