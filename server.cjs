/**
 * outcome-server/server.cjs
 * Simple Express server to turn quiz answers into a fragrance recommendation.
 * CommonJS (require) version; uses Node 18+ global fetch (no node-fetch needed).
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: __dirname + '/.env' });

const app = express();

app.use(express.static(__dirname));

// 1M request body size
app.use(express.json({ limit: '1mb' }));
// Allow cross-origin requests while developing
app.use(cors({ origin: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Config ---
if (!process.env.OPENAI_API_KEY) {
  console.warn('[WARN] OPENAI_API_KEY missing. Set it in .env');
}
const PORT = process.env.PORT || 3000;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// --- Helpers ---

/**
 * createPrompt
 * Builds the user prompt string for the LLM.
 * @param {string} name - User name from the quiz
 * @param {string[]} answers - Collected answers (slugs/labels)
 * @returns {string} - Prompt text for the AI
 */
function createPrompt(name, answers) {
  // Guard against weird values to avoid accidental "undefined" in the prompt.
  const safeName = (name || '').toString().trim() || 'Friend';
  const safeAnswers = Array.isArray(answers) ? answers.map(String) : [];

  return `
Your task is to act as a luxury fragrance stylist creating a custom perfume recommendation based on a user's scent preferences.

The user has just completed a 10-question quiz (floral notes, base notes, drinks, edible notes, aesthetic, season, occasion, intensity, budget, and name). Generate a recommendation tailored to their personality and preferences.

INCLUDE:
You are generating the final fragrance quiz outcome for a user based on their answers.  
Format your response using **Markdown** so it is clean and easy to read.  
Follow these rules:  

- Use short paragraphs (max 2–3 sentences).  Recomend one fragrance and commit strictly to price range selected by user. 
- Use clear headings with emojis and an empty row before starting a new paragraph.  
 [Fragrance Name and description - in red bold letters. Why do I recomend this?]
- Keep the tone fun, light, and personal.  

Your output should follow this structure exactly:  

 🎉 Your Fragrance Fortune  

 👤  
Write 2–3 sentences connecting the user’s quiz answers to their fragrance personality.  

 🌸 Your Suggested Fragrance ( choose only one fragrance that matches the pick your budget option selected by user and format response as below)
- **Budget Friendly:** [Name] – 1 sentence description  
- **Mid-range pick:** [Name] – 1 sentence description  
- **Premium pick:** [Name] – 1 sentence description 
- **Luxury pick:** [Name] – 1 sentence description  

## ✨ Final Note  
A warm closing remark in 1–2 sentences.  

The response must be returned with HTML styled using CSS to suite the mood of the selections made by the user.
Create a styled HTML block that shows a fragrance suggestion using inline CSS.
"Do not include any triple backticks or markdown formatting."

Use the following user input:
Name: ${safeName}
Preferences: ${safeAnswers.join(', ')}
`.trim();
}

/**
 * callOpenAI
 * Makes a Chat Completions API call.
 * @param {string} prompt
 * @returns {Promise<string>} model text
 */
async function callOpenAI(prompt) {
  const controller = new AbortController();
  // Optional timeout so the request doesn't hang forever
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are a luxury fragrance stylist.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    const data = await res.json();

    // Surface API errors nicely
    if (!res.ok) {
      const msg = data?.error?.message || `OpenAI error (status ${res.status})`;
      throw new Error(msg);
    }

    // Extract text safely
    const text = (data.choices?.[0]?.message?.content || '').trim();
    if (text) return text;

    // Fallback:
    if (Array.isArray(data.output)) {
      const parts = data.output.flatMap(o => Array.isArray(o.content) ? o.content : []);
      const found = parts.find(p => typeof p?.text === 'string' && p.text.trim());
      if (found) return found.text.trim();
    }

    throw new Error('No text returned from model.');
  } finally {
    clearTimeout(timeout);
  }
}

// --- Routes ---

/**
 * Health check
 */
app.get('/ping', (_req, res) => {
  res.json({ ok: true, message: 'pong' });
});

/**
 * Quick AI connectivity check
 */
app.get('/ai-test', async (_req, res) => {
  try {
    const text = await callOpenAI('Reply with OK only.');
    res.json({ ok: true, text });
  } catch (err) {
    res.status(400).json({ ok: false, error: String(err.message || err) });
  }
});

/**
 * Env probing (for local debugging)
 * Returns whether the key exists (not the key itself).
 */
app.get('/env-check', (_req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    model: OPENAI_MODEL,
  });
});

/**
 * Main endpoint
 * POST /generate-outcome
 * Body: { name: string, answers: string[] }
 */
app.post('/generate-outcome', async (req, res) => {
  try {
    const { name, answers } = req.body || {};

    // Basic input validation
    if (typeof name !== 'string' || !Array.isArray(answers)) {
      return res.status(400).json({ ok: false, error: 'Invalid input: expected { name: string, answers: string[] }' });
    }

    console.log('[quiz] received:', { name, count: answers.length });

    const prompt = createPrompt(name, answers);
    const text = await callOpenAI(prompt);

    return res.json({ ok: true, text });
  } catch (err) {
    console.error('[generate-outcome] error:', err);
    const msg = err?.name === 'AbortError'
      ? 'Upstream timeout. Please try again.'
      : (err?.message || 'Unknown server error.');
    res.status(500).json({ ok: false, error: msg });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});