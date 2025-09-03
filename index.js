require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const sequelize = require("./config/db");

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "public")));

const cotizaciones = require("./routes/cotizaciones");
app.use("/api/cotizaciones", cotizaciones);

// Ruta principal para servir el frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

sequelize.sync({ alter: true }).then(() => {
  console.log("✅ UltraBase conectada y sincronizada correctamente.");
  app.listen(5000, "0.0.0.0", () => {
    console.log(`🚀 Servidor de UltraBase corriendo en puerto 5000`);
  });
}).catch(err => {
  console.error("❌ Error al conectar UltraBase:", err);
});