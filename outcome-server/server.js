// step 2: minimal express server with one test route
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8010;

app.get('/ping', (req, res) => {
  res.json({ ok: true, message: 'pong' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
