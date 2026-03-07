import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const ExtractedSchema = z.object({
  salesPersonName: z.string().nullable(),
  customerName: z.string().nullable(),
  productName: z.string().nullable(),
  productCategory: z.string().nullable(),
  dateNeeded: z.string().nullable(),
  targetPrice: z.number().nullable(),
  annualVolume: z.number().nullable(),
  quickNote: z.string().nullable(),
  priority: z.enum(['High', 'Medium', 'Low']).nullable(),
  status: z.enum([
    'New', 'In Review', 'Sourcing', 'Waiting on Supplier',
    'Quoted', 'Awaiting Customer Response', 'On Hold', 'Won', 'Lost', 'Completed',
  ]).nullable(),
  isSourcingRequest: z.boolean().nullable(),
  requestedBy: z.string().nullable(),
  nextAction: z.string().nullable(),
  supplierName: z.string().nullable(),
  assignedOwner: z.string().nullable(),
  followUpDate: z.string().nullable(),
  internalComments: z.string().nullable(),
});

export type ParsedOpportunity = z.infer<typeof ExtractedSchema> & { fieldsFound: string[] };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { callReport } = body as { callReport: string };

  if (!callReport?.trim()) {
    return NextResponse.json({ error: 'Call report text is required' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not set. Add it to your .env.local file or Netlify environment variables.' },
      { status: 500 }
    );
  }

  const client = new OpenAI({ apiKey });
  const today = new Date().toISOString().split('T')[0];

  try {
    const completion = await client.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You extract structured opportunity data from sales call reports, meeting notes, and emails.
Today's date is ${today}. Use YYYY-MM-DD format for all dates.

Priority rules:
- High: urgent language, "ASAP", "critical", deadline within 1-2 weeks
- Medium: normal timeline
- Low: no urgency, long lead time

Set isSourcingRequest to true if someone is asking you to find, source, or locate a product for them.

Only extract fields clearly mentioned or strongly implied. Return null for fields not found.`,
        },
        {
          role: 'user',
          content: `Extract opportunity data from this call report:\n\n${callReport}`,
        },
      ],
      response_format: zodResponseFormat(ExtractedSchema, 'opportunity'),
    });

    const parsed = completion.choices[0].message.parsed;
    const fieldsFound = Object.entries(parsed ?? {})
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k]) => k);

    return NextResponse.json({ data: { ...parsed, fieldsFound } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OpenAI request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
