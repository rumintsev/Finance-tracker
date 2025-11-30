import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM expenses ORDER BY id DESC LIMIT 5');
    const count = await pool.query('SELECT COUNT(*) AS total FROM expenses');

    return NextResponse.json({
      data: res.rows.map(r => ({ ...r, date: formatDate(new Date(r.date)) })),
      total: Number(count.rows[0].total)
    });
  } catch (err) {
    console.error('GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, amount, date } = await req.json();

    const res = await pool.query(
      'INSERT INTO expenses(name, amount, date) VALUES($1, $2, $3) RETURNING *',
      [name, amount, date]
    );

    return NextResponse.json({
      ...res.rows[0],
      date: formatDate(new Date(res.rows[0].date))
    });
  } catch (err) {
    console.error('POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}