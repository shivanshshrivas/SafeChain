const express = require('express');
const app = express();
const PORT = 3001;

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
