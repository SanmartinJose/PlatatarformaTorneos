const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const torneoRoutes = require('./routes/torneoRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/torneos', torneoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
