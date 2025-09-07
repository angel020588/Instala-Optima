const express = require("express");
const router = express.Router();

// 🧠 Estado en memoria (puedes migrarlo a BD cuando quieras)
let estado = {
  nivel: null, // 0-100
  comando: "ESPERAR", // ENCENDER | APAGAR | ESPERAR
  modo: "AUTO", // AUTO | MANUAL
  updatedAt: null,
};

// 🔧 Umbrales automáticos (ajústalos si quieres)
const UMBRAL_ENCENDER = 20; // <= 20% enciende
const UMBRAL_APAGAR = 95; // >= 95% apaga

// 🔁 Lógica automática
function calcularComandoAuto(nivel) {
  if (nivel <= UMBRAL_ENCENDER) return "ENCENDER";
  if (nivel >= UMBRAL_APAGAR) return "APAGAR";
  return "ESPERAR";
}

// ✅ ESP32 envía nivel (x-www-form-urlencoded o JSON)
// Devuelvo SOLO el comando en texto plano.
router.post("/", (req, res) => {
  // Soportar ambos formatos
  const nivel = Number(req.body?.nivel ?? req.query?.nivel);
  if (Number.isNaN(nivel) || nivel < 0 || nivel > 100) {
    return res.status(400).send("ESPERAR"); // fallback seguro
  }

  estado.nivel = Math.round(nivel);
  estado.updatedAt = new Date().toISOString();

  if (estado.modo === "AUTO") {
    estado.comando = calcularComandoAuto(estado.nivel);
  }
  // Si está en MANUAL, respetamos el comando ya fijado
  res.type("text/plain").send(estado.comando);
});

// ✅ Forzar comando manual: ENCENDER | APAGAR
router.post("/comando", (req, res) => {
  const accionRaw = (req.body?.accion || req.query?.accion || "")
    .toString()
    .toUpperCase();
  const accion = ["ENCENDER", "APAGAR"].includes(accionRaw) ? accionRaw : null;
  if (!accion)
    return res.status(400).json({ ok: false, error: "accion inválida" });

  estado.modo = "MANUAL";
  estado.comando = accion;
  estado.updatedAt = new Date().toISOString();
  return res.json({ ok: true, ...estado });
});

// ✅ Cambiar modo: AUTO | MANUAL
router.post("/modo", (req, res) => {
  const modoRaw = (req.body?.modo || req.query?.modo || "")
    .toString()
    .toUpperCase();
  if (!["AUTO", "MANUAL"].includes(modoRaw)) {
    return res.status(400).json({ ok: false, error: "modo inválido" });
  }
  estado.modo = modoRaw;

  // si regresamos a AUTO, recalculamos
  if (estado.modo === "AUTO" && typeof estado.nivel === "number") {
    estado.comando = calcularComandoAuto(estado.nivel);
  }
  estado.updatedAt = new Date().toISOString();
  return res.json({ ok: true, ...estado });
});

// ✅ Consultar estado (para la app)
router.get("/estado", (req, res) => {
  return res.json({ ok: true, ...estado });
});

module.exports = router;
