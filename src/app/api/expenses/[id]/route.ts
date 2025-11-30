import { NextRequest, NextResponse } from 'next/server';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'finance_tracker',
  password: '0000',
  port: 5432,
});

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, amount, date } = body;

    const res = await pool.query(
      `UPDATE expenses SET name = COALESCE($1, name), amount = COALESCE($2, amount), 
       date = COALESCE($3, date) WHERE id = $4 RETURNING *`,
      [name ?? null, amount ?? null, date ?? null, Number(id)]
    );

    if (!res.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      ...res.rows[0],
      date: formatDate(new Date(res.rows[0].date))
    });
  } catch (err) {
    console.error('PATCH error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [Number(id)]);

    if (!res.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}