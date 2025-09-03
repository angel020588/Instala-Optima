const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Ruta para guardar cotización - redirigir a API
app.post("/guardar", (req, res) => {
  const cotizacion = req.body;
  console.log("📥 Cotización recibida, redirigiendo a UltraBase...");
  
  // Redirigir a la API de UltraBase
  res.status(200).json({ 
    mensaje: "✅ Cotización procesada, guardando en UltraBase...",
    redirect: "/api/cotizaciones/guardar"
  });
});

// Servir index.html por defecto
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
