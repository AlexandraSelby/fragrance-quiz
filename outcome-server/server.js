// outcome-server/server.js
require('dotenv').config(); // load .env

const express = require('express');

const app = express();
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

