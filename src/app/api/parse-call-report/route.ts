import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

const ExtractedSchema = z.object({
  salesPersonName: z.string().optional(),
  customerName: z.string().optional(),
  productName: z.string().optional(),
  productCategory: z.string().optional(),
  dateNeeded: z.string().optional(),
  targetPrice: z.number().nullable().optional(),
  annualVolume: z.number().nullable().optional(),
  quickNote: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  status: z.enum([
    'New', 'In Review', 'Sourcing', 'Waiting on Supplier',
    'Quoted', 'Awaiting Customer Response', 'On Hold', 'Won', 'Lost', 'Completed',
  ]).optional(),
  isSourcingRequest: z.boolean().optional(),
  requestedBy: z.string().optional(),
  nextAction: z.string().optional(),
  supplierName: z.string().optional(),
  assignedOwner: z.string().optional(),
  followUpDate: z.string().optional(),
  internalComments: z.string().optional(),
  fieldsFound: z.array(z.string()),
});

export type ParsedOpportunity = z.infer<typeof ExtractedSchema>;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { callReport } = body as { callReport: string };

  if (!callReport?.trim()) {
    return NextResponse.json({ error: 'Call report text is required' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not set. Add it to your .env.local file or Netlify environment variables.' },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });
  const today = new Date().toISOString().split('T')[0];

  const response = await client.messages.parse({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: `You extract structured opportunity data from sales call reports, meeting notes, and emails.
Today's date is ${today}. Use YYYY-MM-DD format for all dates.

Priority rules:
- High: urgent language, "ASAP", "critical", deadline within 1-2 weeks
- Medium: normal timeline
- Low: no urgency, long lead time

Set isSourcingRequest to true if someone is asking you to find, source, or locate a product for them.

For fieldsFound, list the camelCase field names that you successfully extracted (e.g. ["customerName", "productName", "dateNeeded"]).

Only extract fields clearly mentioned or strongly implied. Leave fields undefined if not found.`,
    messages: [
      { role: 'user', content: `Extract opportunity data from this call report:\n\n${callReport}` },
    ],
    output_config: {
      format: zodOutputFormat(ExtractedSchema),
    },
  });

  return NextResponse.json({ data: response.parsed_output });
}
