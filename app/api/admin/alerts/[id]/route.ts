import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdmin();
    const { is_read } = await req.json();

    await query('UPDATE alerts SET is_read = $1 WHERE id = $2', [is_read, params.id]);
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
