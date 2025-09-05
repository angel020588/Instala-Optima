
const express = require("express");
const router = express.Router();

// ✅ Ruta GET para pruebas desde navegador
router.get("/", (req, res) => {
  const nivel = parseInt(req.query.nivel);
  
  if (isNaN(nivel)) {
    return res.status(400).send("nivel inválido");
  }

  console.log("📡 Nivel GET recibido:", nivel + "%");

  if (nivel <= 20) {
    return res.send("encender");
  } else if (nivel >= 95) {
    return res.send("apagar");
  } else {
    return res.send("esperar");
  }
});

// ✅ Ruta POST para peticiones reales desde ESP32
router.post("/", (req, res) => {
  const nivel = parseInt(req.body.nivel);
  const dispositivo = req.body.dispositivo || "ESP32";

  if (isNaN(nivel)) {
    return res.status(400).json({ error: "Nivel inválido" });
  }

  console.log("📡 Nivel POST recibido:", nivel + "%", "Dispositivo:", dispositivo);

  let comando = "esperar";
  if (nivel <= 20) {
    comando = "encender";
  } else if (nivel >= 95) {
    comando = "apagar";
  }

  res.json({
    comando: comando,
    nivel: nivel,
    mensaje: `Nivel ${nivel}% - ${comando} bomba`
  });
});

module.exports = router;
