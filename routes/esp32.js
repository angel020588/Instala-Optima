
const express = require('express');
const router = express.Router();

// Ruta para recibir datos del ESP32
router.get('/', (req, res) => {
  const nivel = parseInt(req.query.nivel);

  if (isNaN(nivel)) {
    return res.status(400).send('nivel inválido');
  }

  console.log('📡 Nivel recibido del ESP32:', nivel + '%');

  if (nivel <= 20) {
    return res.send('encender');
  } else if (nivel >= 95) {
    return res.send('apagar');
  } else {
    return res.send('esperar');
  }
});

// Ruta POST para recibir datos del ESP32 (alternativa)
router.post('/', (req, res) => {
  const { nivel, dispositivo } = req.body;

  if (isNaN(nivel)) {
    return res.status(400).json({ error: 'Nivel inválido' });
  }

  console.log('📡 Datos ESP32:', { dispositivo, nivel: nivel + '%' });

  let comando = 'esperar';
  if (nivel <= 20) {
    comando = 'encender';
  } else if (nivel >= 95) {
    comando = 'apagar';
  }

  res.json({ 
    comando: comando,
    nivel: nivel,
    mensaje: `Nivel ${nivel}% - ${comando} bomba`
  });
});

module.exports = router;
