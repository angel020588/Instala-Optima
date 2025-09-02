const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Ruta para guardar cotización (temporal)
app.post("/guardar", (req, res) => {
  const cotizacion = req.body;
  console.log("📥 Cotización recibida:", cotizacion);

  // Simulación de guardado
  // Aquí podrías conectar con UltraBase o una base real
  res.json({ status: "ok", message: "Cotización guardada correctamente" });
});

// Servir index.html por defecto
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
