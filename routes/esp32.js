const express = require("express");
const router = express.Router();

// ===========================
// 📡 Ruta POST (principal para ESP32)
// ===========================
router.post("/", (req, res) => {
  const nivel = parseInt(req.body.nivel);
  const dispositivo = req.body.dispositivo || "ESP32";

  if (isNaN(nivel)) {
    return res.status(400).json({ error: "Nivel inválido" });
  }

  console.log(
    "📡 Nivel POST recibido:",
    nivel + "% | Dispositivo:",
    dispositivo,
  );

  let comando = "esperar";

  if (nivel <= 20) {
    comando = "encender";
  } else if (nivel >= 95) {
    comando = "apagar";
  }

  return res.json({
    comando,
    nivel,
    mensaje: `Nivel ${nivel}% - ${comando} bomba`,
  });
});

// ===========================
// 🌐 Ruta GET (para pruebas manuales en navegador)
// ===========================
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

module.exports = router;
