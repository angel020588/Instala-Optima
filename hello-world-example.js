
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello World from Replit! 🚀');
});

// Health check para deployment
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// IMPORTANTE: bind a 0.0.0.0 para Replit Deployment
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 App listening on port ${port}`);
});
