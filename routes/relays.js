
const express = require("express");
const router = express.Router();
const Nivel = require("../models/Nivel");

router.get("/comando", async (req, res) => {
  try {
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

    console.log("🚰 Nivel:", nivel + "% → Comando:", comando);
    res.send(comando);
  } catch (error) {
    console.error("❌ Error al obtener nivel:", error);
    res.status(500).send("esperar");
  }
});

module.exports = router;
