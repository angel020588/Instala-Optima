const express = require("express");
const router = express.Router();
const Nivel = require("../models/Nivel");

// Recibir datos desde el ESP32
router.post("/", async (req, res) => {
  const { dispositivo, porcentaje, estado_bomba } = req.body;

  // ✅ Validación de datos de entrada
  if (!dispositivo || isNaN(porcentaje) || !estado_bomba) {
    console.log("❌ Datos incompletos recibidos:", { dispositivo, porcentaje, estado_bomba });
    return res.status(400).json({ 
      ok: false, 
      mensaje: "Datos incompletos o inválidos",
      esperados: {
        dispositivo: "string requerido",
        porcentaje: "número requerido (0-100)",
        estado_bomba: "string requerido"
      }
    });
  }

  // ✅ Validación adicional del porcentaje
  const porcentajeNum = Number(porcentaje);
  if (porcentajeNum < 0 || porcentajeNum > 100) {
    console.log("❌ Porcentaje fuera de rango:", porcentajeNum);
    return res.status(400).json({ 
      ok: false, 
      mensaje: "El porcentaje debe estar entre 0 y 100" 
    });
  }

  try {
    await Nivel.create({ 
      dispositivo: dispositivo.toString().trim(),
      porcentaje: porcentajeNum, 
      estado_bomba: estado_bomba.toString().toUpperCase().trim()
    });
    console.log("📡 Datos del ESP32 guardados:", {
      dispositivo,
      porcentaje: porcentajeNum,
      estado_bomba,
    });
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
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    res.json(historial);
  } catch (error) {
    console.error("❌ Error al obtener historial:", error);
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
