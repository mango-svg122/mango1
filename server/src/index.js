const express = require('express');
const cors = require('cors');
const path = require('path');
const baziRoutes = require('./routes/bazi');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../../public')));

app.use('/api/bazi', baziRoutes);

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`OracleDivine server running on http://localhost:${PORT}`);
});