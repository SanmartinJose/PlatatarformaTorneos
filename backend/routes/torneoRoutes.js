const express = require('express');
const router = express.Router();

// Ruta de prueba temporal
router.get('/', (req, res) => {
  res.json({ mensaje: 'Ruta de torneos funcionando' });
});

module.exports = router;
