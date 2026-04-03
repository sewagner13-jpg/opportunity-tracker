import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/neon';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM opportunities ORDER BY date_entered DESC NULLS LAST
    `;
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error('GET /api/opportunities failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const row = await req.json();
    await sql`
      INSERT INTO opportunities (
        id, sales_person_name, date_entered, date_needed, target_price, annual_volume,
        quick_note, customer_name, product_name, product_category, status, priority,
        completion_percent, assigned_owner, supplier_name, last_updated, next_action,
        follow_up_date, estimated_margin, actual_quoted_price, outcome_reason,
        internal_comments, is_completed, date_completed, include_in_todays_focus,
        todays_focus_rank, is_sourcing_request, requested_by
      ) VALUES (
        ${row.id}, ${row.sales_person_name}, ${row.date_entered || null}, ${row.date_needed || null},
        ${row.target_price ?? null}, ${row.annual_volume ?? null}, ${row.quick_note},
        ${row.customer_name}, ${row.product_name}, ${row.product_category}, ${row.status},
        ${row.priority}, ${row.completion_percent}, ${row.assigned_owner}, ${row.supplier_name},
        ${row.last_updated || null}, ${row.next_action}, ${row.follow_up_date || null},
        ${row.estimated_margin ?? null}, ${row.actual_quoted_price ?? null}, ${row.outcome_reason},
        ${row.internal_comments}, ${row.is_completed}, ${row.date_completed || null},
        ${row.include_in_todays_focus}, ${row.todays_focus_rank}, ${row.is_sourcing_request},
        ${row.requested_by}
      )
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/opportunities failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const sql = getDb();
    await sql`DELETE FROM opportunities WHERE id != ''`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/opportunities failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
