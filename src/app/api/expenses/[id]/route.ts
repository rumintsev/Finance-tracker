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
    let { name, amount, date } = body;

    if (name === "") name = "Без имени";
    if (date === "") date = formatDate(new Date());
    if (amount === "") amount = 0;

    if (name !== undefined && typeof name !== "string")
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });

    if (amount !== undefined && typeof amount !== "number")
      return NextResponse.json({ error: "Amount must be a number" }, { status: 400 });

    if (date !== undefined && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())))
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });

    const res = await pool.query(
      `UPDATE expenses SET name = COALESCE($1, name), amount = COALESCE($2, amount), 
       date = COALESCE($3, date) WHERE id = $4 RETURNING *`,
      [name, amount, date, Number(id)]
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