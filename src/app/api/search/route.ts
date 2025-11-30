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

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    if (!q.trim()) return NextResponse.json([]);

    const res = await pool.query(
      'SELECT * FROM expenses WHERE name ILIKE $1 ORDER BY id DESC LIMIT 100',
      [`%${q}%`]
    );

    return NextResponse.json(
      res.rows.map(r => ({ ...r, date: formatDate(new Date(r.date)) }))
    );
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}