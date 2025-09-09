// outcome-server/server.js
const fetch = require('node-fetch');
const cors = require('cors');

require('dotenv').config({ path: __dirname + '/.env' });
 // load .env first
console.log("API KEY FROM ENV:", process.env.OPENAI_API_KEY);

const express = require('express');
const app = express();
app.use(cors());

app.post('/generate-outcome', async (req, res) => {
  const { name, answers } = req.body;

  if (!name || !Array.isArray(answers)) {
    return res.status(400).json({ ok: false, error: 'Invalid input' });
  }

  console.log("Received from quiz:", { name, answers });

  const prompt = `
Your task is to act as a luxury fragrance stylist creating a custom perfume recommendation based on a user's scent preferences.

The user has just completed a 10-question quiz, which asked about their preferences for floral notes, base notes, drinks, edible notes, aesthetic, season, occasion, intensity, budget, and their name. You are now to generate a fragrance recommendation tailored to their personality and preferences.

INCLUDE:
- The user's name in the opening sentence
- A poetic and imaginative description of their scent aura or "scent spirit"
- Recommend 3 specific real perfumes:
  - One from https://soghaat.co.uk
  - One from https://www.notino.co.uk
  - One from either https://www.harrods.com/en-gb or https://www.superdrug.com
- Match each fragrance to a theme based on the quiz answers (e.g., "date-night boldness", "light spring freshness", "gourmand indulgence", "mysterious oud")
- Include direct product page links when possible
- Include a sentence on why that perfume matches their chosen vibe and budget
- Use evocative, sensory-rich language
- Keep the tone personal and premium

Use the following user input:
Name: ${name}
Preferences: ${answers.join(", ")}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: "You are a luxury fragrance stylist." },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 600
      })
    });

    const data = await response.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();

    if (data.error) return res.status(400).json({ ok: false, error: data.error });

    res.json({ ok: true, text });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

const PORT = process.env.PORT || 8017;

console.log(process.env.OPENAI_API_KEY);

app.get('/ping', (req, res) => { // basic health
  res.json({ ok: true, message: 'pong' });
});
app.get('/ai-test', async (req, res) => {
  try {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
  },
  body: JSON.stringify({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [
      { role: 'user', content: 'Reply with OK only.' }
    ],
    max_tokens: 10
  })
});

    const j = await r.json();

    // Robust text extraction for Responses API
    let text = (j.choices?.[0]?.message?.content || '').trim();
    if (!text && Array.isArray(j.output)) {
      const parts = j.output.flatMap(o => Array.isArray(o.content) ? o.content : []);
      const found = parts.find(p => typeof p?.text === 'string' && p.text.trim());
      if (found) text = found.text.trim();
    }

    // If API returned an error, surface it
    if (j.error) return res.status(400).json({ ok: false, error: j.error });

    res.json({ ok: true, text });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});
app.get('/env-check', (req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || null
  });
});

app.listen(PORT, () => { // start server
  console.log(`Server running at http://localhost:${PORT}`);
});
