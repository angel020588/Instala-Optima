const express = require("express");
const router = express.Router();
const Nivel = require("../models/Nivel");

// Recibir datos desde el ESP32
router.post("/", async (req, res) => {
  const { dispositivo, porcentaje, estado_bomba } = req.body;

  try {
    await Nivel.create({ dispositivo, porcentaje, estado_bomba });
    console.log("📡 Datos del ESP32 guardados:", { dispositivo, porcentaje, estado_bomba });
    res.status(200).json({ ok: true, mensaje: "Nivel guardado correctamente" });
  } catch (error) {
    console.error("❌ Error al guardar nivel:", error);
    res.status(500).json({ ok: false, mensaje: "Error interno" });
  }
});

// Devolver historial para la página
router.get("/historial", async (req, res) => {
  try {
    const historial = await Nivel.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(historial);
  } catch (error) {
    console.error("❌ Error al obtener historial:", error);
    res.status(500).json({ ok: false });
  }
});

module.exports = router;