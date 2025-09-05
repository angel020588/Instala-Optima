const express = require("express");
const router = express.Router();

// Ruta POST que espera el dato 'nivel' desde el ESP32
router.post("/", (req, res) => {
  const nivel = parseInt(req.body.nivel);

  if (isNaN(nivel)) {
    return res.status(400).send("nivel inválido");
  }

  console.log("🧪 Nivel recibido del ESP32:", nivel + "%");

  // Lógica para controlar la bomba
  if (nivel <= 20) {
    return res.send("encender");
  } else if (nivel >= 95) {
    return res.send("apagar");
  } else {
    return res.send("esperar");
  }
});

module.exports = router;
