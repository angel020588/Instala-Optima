require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const sequelize = require("./config/db");

// Middleware
app.use(cors());
app.use(express.json());

// Evitar caché en producción
app.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

// Servir archivos estáticos del frontend (desde carpeta public/)
app.use(express.static(path.join(__dirname, "public")));

// Rutas existentes

const cotizaciones = require("./routes/cotizaciones");
app.use("/api/cotizaciones", cotizaciones);

const nivelRoutes = require("./routes/nivel");
app.use("/api/nivel", nivelRoutes);

const esp32Routes = require("./routes/esp32");
app.use("/api/esp32", esp32Routes);

// Ruta de Chat IA
app.post("/api/chat", async (req, res) => {
  try {
    const { mensaje, contexto } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: contexto },
          { role: "user", content: mensaje },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.json({ respuesta: data.choices[0].message.content });
    } else {
      throw new Error("Respuesta inválida de OpenAI");
    }
  } catch (error) {
    console.error("❌ Error en chat IA:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      respuesta:
        "Lo siento, tengo problemas técnicos temporales. Intenta de nuevo en unos momentos.",
    });
  }
});

// ✅ Ruta ESP32 funcional

// Ruta raíz para frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Ruta directa para recibir datos del ESP32
app.get("/api/esp32", (req, res) => {
  const nivel = parseInt(req.query.nivel);

  if (isNaN(nivel)) {
    return res.status(400).send("nivel inválido");
  }

  console.log("📡 Nivel recibido del ESP32:", nivel + "%");

  if (nivel <= 20) {
    return res.send("encender");
  } else if (nivel >= 95) {
    return res.send("apagar");
  } else {
    return res.send("esperar");
  }
});

// Conexión y arranque
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ UltraBase conectada y sincronizada correctamente.");
    app.listen(5000, "0.0.0.0", () => {
      console.log("🚀 Servidor de UltraBase corriendo en puerto 5000");
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar UltraBase:", err);
  });
