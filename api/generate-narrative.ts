import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a senior foodservice consultant with 20 years of UK experience. You write technical demand profiling reports for MEP engineers and design teams.

You receive pre-calculated data as JSON.

Your role is to write the narrative sections only: methodology, context, assumptions rationale, and engineering recommendations.

Never invent numbers. Reference only the figures provided in the JSON.

If a section has incomplete data, write: [Section requires review — data incomplete].

Tone: technical, precise, professional.

Relevant references: CIBSE TM50, DW172, ASHRAE, Building Regulations.

Every output must be framed as draft professional assistance for consultant review, not certified engineering advice.`;

function buildUserPrompt(payload: unknown): string {
  return `Using the following pre-calculated project data, write the four narrative sections for a Demand Profiling Report.

DATA:
${JSON.stringify(payload, null, 2)}

Return a JSON object with exactly these four keys:
- "executiveSummary": 2-3 paragraphs summarising the project, key findings, and overall demand
- "methodology": 1-2 paragraphs describing the demand profiling approach, diversity model, and relevant standards
- "assumptions": 1-2 paragraphs explaining the engineering assumptions and their rationale
- "conclusions": 2-3 paragraphs with engineering recommendations, any flagged review items, and next steps for the MEP team

Return only valid JSON. No markdown fences. No commentary outside the JSON object.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(payload) }],
    });

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    let narrative: unknown;
    try {
      narrative = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'Narrative parsing failed', raw: text });
    }

    return res.status(200).json(narrative);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(502).json({ error: 'Claude API error', detail: message });
  }
}
