import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/neon';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const row = await req.json();
    await sql`
      UPDATE opportunities SET
        sales_person_name = ${row.sales_person_name},
        date_entered = ${row.date_entered || null},
        date_needed = ${row.date_needed || null},
        target_price = ${row.target_price ?? null},
        annual_volume = ${row.annual_volume ?? null},
        quick_note = ${row.quick_note},
        customer_name = ${row.customer_name},
        product_name = ${row.product_name},
        product_category = ${row.product_category},
        status = ${row.status},
        priority = ${row.priority},
        completion_percent = ${row.completion_percent},
        assigned_owner = ${row.assigned_owner},
        supplier_name = ${row.supplier_name},
        last_updated = ${row.last_updated || null},
        next_action = ${row.next_action},
        follow_up_date = ${row.follow_up_date || null},
        estimated_margin = ${row.estimated_margin ?? null},
        actual_quoted_price = ${row.actual_quoted_price ?? null},
        outcome_reason = ${row.outcome_reason},
        internal_comments = ${row.internal_comments},
        is_completed = ${row.is_completed},
        date_completed = ${row.date_completed || null},
        include_in_todays_focus = ${row.include_in_todays_focus},
        todays_focus_rank = ${row.todays_focus_rank},
        is_sourcing_request = ${row.is_sourcing_request},
        requested_by = ${row.requested_by}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT /api/opportunities/[id] failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM opportunities WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/opportunities/[id] failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await req.json();
    // Partial update — only todays_focus_rank used for reorder
    await sql`
      UPDATE opportunities SET
        todays_focus_rank = ${body.todays_focus_rank}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/opportunities/[id] failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
