const express = require("express");
const router = express.Router();
const Nivel = require("../models/Nivel");

router.post("/", async (req, res) => {
  const nivel = parseFloat(req.body.nivel);
  const dispositivo = req.body.dispositivo || "ESP32";

  if (isNaN(nivel)) {
    return res.status(400).json({ error: "Nivel inválido" });
  }

  console.log(
    "📡 Nivel POST recibido:",
    nivel + "%",
    "Dispositivo:",
    dispositivo,
  );

  // Determinar estado de la bomba
  let estado_bomba = "esperar";
  if (nivel <= 20) {
    estado_bomba = "encender";
  } else if (nivel >= 95) {
    estado_bomba = "apagar";
  }

  try {
    // Guardar en la BD
    await Nivel.create({
      dispositivo,
      porcentaje: nivel,
      estado_bomba,
    });

    res.json({
      comando: estado_bomba,
      nivel,
      mensaje: `Nivel ${nivel}% - ${estado_bomba} bomba`,
    });
  } catch (err) {
    console.error("❌ Error al guardar en la base de datos:", err);
    res.status(500).json({ error: "Error al guardar en la base de datos" });
  }
});

module.exports = router;
