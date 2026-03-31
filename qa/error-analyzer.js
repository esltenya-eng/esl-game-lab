import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are an AI QA Engineer for ESL Game Lab, an AI-powered English classroom game generator used by teachers.

System context:
- API: Node.js + Express on Cloud Run (us-west1, 512Mi, 1 CPU, min-instances=0)
- AI: Gemini 2.0 Flash (no timeout set, no retry logic)
- Endpoints: POST /api/recommendations, POST /api/game-detail, POST /api/image-proxy/generate
- Cache: In-memory only (resets on Cloud Run restart/cold start)
- Auth: Firebase (frontend only)
- Image generation: placeholder only (not implemented)

Known architectural risks to watch for:
1. Gemini API calls have no timeout → potential infinite hang
2. No retry logic → single Gemini failure = 500 to user
3. min-instances=0 → cold start on first request after idle
4. In-memory cache → lost on every cold start`;

/**
 * Sends error logs to Claude for pattern analysis and report generation.
 */
export async function analyzeErrors(errors) {
  const client = new Anthropic();

  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const period = `${weekAgo.toISOString().slice(0, 10)} ~ ${now.toISOString().slice(0, 10)}`;

  const logLines = errors
    .slice(0, 150)
    .map(e => `[${e.timestamp}] ${e.severity}: ${e.message}`)
    .join('\n');

  const noErrorsMessage =
    errors.length === 0
      ? '\n(No errors found in this period - service appears healthy)\n'
      : '';

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze the following Cloud Run error logs (${errors.length} total) for the period ${period} and produce a weekly maintenance report.${noErrorsMessage}

${logLines || '(No error logs)'}

Output the report in exactly this format (keep it concise and actionable):

## ESL Game Lab Weekly QA Report
**Period:** ${period}
**Total Errors:** [count]

### Top Error Patterns
[List top 3 patterns with count and affected endpoint. If none, say "No errors detected ✅"]

### Critical Issues
[Any service-breaking or high-frequency issues. If none, say "None this week"]

### Top 3 Recommendations
1. [Actionable fix] — Effort: [S/M/L]
2. [Actionable fix] — Effort: [S/M/L]
3. [Actionable fix] — Effort: [S/M/L]

### Health Score: [0-100]
[One sentence reasoning]

---
SUMMARY: [One SMS-friendly line, max 120 chars, Korean OK]`,
      },
    ],
  });

  return response.content[0].text;
}
