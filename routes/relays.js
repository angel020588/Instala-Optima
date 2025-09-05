
const express = require("express");
const router = express.Router();
const Nivel = require("../models/Nivel");

// Variable para almacenar el estado manual (se reinicia al reiniciar servidor)
let estadoManual = null; // null = automático, "encender" o "apagar" = manual

router.get("/comando", async (req, res) => {
  try {
    // Si hay comando manual activo, devolverlo
    if (estadoManual) {
      console.log("🔧 Comando manual activo:", estadoManual);
      return res.send(estadoManual);
    }

    // Si no hay comando manual, usar lógica automática
    const ultimoRegistro = await Nivel.findOne({
      order: [["createdAt", "DESC"]],
    });

    if (!ultimoRegistro) {
      return res.status(404).send("esperar"); // No hay datos aún
    }

    const nivel = ultimoRegistro.porcentaje;

    let comando = "esperar";
    if (nivel <= 20) {
      comando = "encender";
    } else if (nivel >= 95) {
      comando = "apagar";
    }

    console.log("🚰 Nivel:", nivel + "% → Comando automático:", comando);
    res.send(comando);
  } catch (error) {
    console.error("❌ Error al obtener nivel:", error);
    res.status(500).send("esperar");
  }
});

// Nueva ruta para control manual
router.post("/manual", (req, res) => {
  const comando = req.body.comando;

  if (!comando || !["encender", "apagar", "automatico"].includes(comando)) {
    return res.status(400).json({ 
      error: "Comando inválido. Usa: encender, apagar o automatico" 
    });
  }

  if (comando === "automatico") {
    estadoManual = null; // Volver a modo automático
    console.log("🔄 Modo automático activado");
    res.json({ mensaje: "Modo automático activado", estado: "automatico" });
  } else {
    estadoManual = comando; // Guardar comando manual
    console.log("🔧 Comando manual establecido:", comando);
    res.json({ mensaje: `Bomba ${comando} manualmente`, estado: comando });
  }
});

// Ruta para obtener el estado actual (manual o automático)
router.get("/estado", (req, res) => {
  res.json({
    modo: estadoManual ? "manual" : "automatico",
    comando: estadoManual || "automatico"
  });
});

module.exports = router;
