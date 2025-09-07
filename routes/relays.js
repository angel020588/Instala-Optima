
const express = require("express");
const router = express.Router();
const Nivel = require("../models/Nivel");
const axios = require("axios");

// IP del ESP32 COM4 (relé) en red local - usar HTTPS por seguridad
const RELAY_IP = "https://192.168.100.39"; // Cambiar por la IP real del COM4
const RELAY_IP_FALLBACK = "http://192.168.100.39"; // Fallback si HTTPS no está disponible

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

// Ruta para control manual - NUEVA VERSIÓN con comunicación directa al ESP32
router.post("/manual", async (req, res) => {
  const comando = req.body.comando;

  if (!comando || !["encender", "apagar", "automatico"].includes(comando)) {
    return res.status(400).json({ 
      error: "Comando inválido. Usa: encender, apagar o automatico" 
    });
  }

  // Si es modo automático, solo cambiar el estado interno
  if (comando === "automatico") {
    estadoManual = null; // Volver a modo automático
    console.log("🔄 Modo automático activado");
    return res.json({ mensaje: "Modo automático activado", estado: "automatico" });
  }

  // Para comandos encender/apagar, enviar al ESP32 COM4
  try {
    console.log(`🔧 Enviando comando "${comando}" al ESP32: ${RELAY_IP}`);
    
    let respuesta;
    try {
      // Intentar HTTPS primero por seguridad
      respuesta = await axios.post(`${RELAY_IP}/api/orden-rele`, comando, {
        headers: { "Content-Type": "text/plain" },
        timeout: 5000 // 5 segundos de timeout
      });
    } catch (httpsError) {
      console.log("⚠️ HTTPS falló, intentando HTTP como fallback:", httpsError.message);
      // Fallback a HTTP si HTTPS no está disponible
      respuesta = await axios.post(`${RELAY_IP_FALLBACK}/api/orden-rele`, comando, {
        headers: { "Content-Type": "text/plain" },
        timeout: 5000
      });
    }

    // Guardar estado manual
    estadoManual = comando;
    console.log("✅ Comando enviado exitosamente al ESP32:", respuesta.data);
    
    res.json({ 
      mensaje: `Bomba ${comando} manualmente - Enviado al ESP32`, 
      estado: comando,
      esp32_respuesta: respuesta.data
    });

  } catch (error) {
    console.error("❌ Error al enviar comando al ESP32:", error.message);
    
    // Aún así guardar el estado manual para el sistema interno
    estadoManual = comando;
    
    res.status(500).json({ 
      error: "Error al enviar al ESP32", 
      detalle: error.message,
      mensaje: `Estado "${comando}" guardado localmente pero no se pudo enviar al ESP32`
    });
  }
});

// Ruta para obtener el estado actual (manual o automático)
router.get("/estado", (req, res) => {
  res.json({
    modo: estadoManual ? "manual" : "automatico",
    comando: estadoManual || "automatico",
    esp32_ip: RELAY_IP
  });
});

module.exports = router;
