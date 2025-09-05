require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const sequelize = require("./config/db");

// ✅ Middlewares necesarios
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <- NECESARIO para datos tipo x-www-form-urlencoded

// ✅ Evitar caché en producción
app.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

// ✅ Servir archivos estáticos del frontend (desde carpeta public/)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Rutas API - orden optimizado
const esp32Routes = require("./routes/esp32");
app.use("/api/esp32", esp32Routes);

const nivelRoutes = require("./routes/nivel");
app.use("/api/nivel", nivelRoutes);

const cotizaciones = require("./routes/cotizaciones");
app.use("/api/cotizaciones", cotizaciones);

// ✅ Ruta de Chat IA con manejo completo de errores
app.post("/api/chat", async (req, res) => {
  try {
    const { mensaje, contexto } = req.body;

    // Validar datos de entrada
    if (!mensaje) {
      return res.status(400).json({
        error: "Mensaje requerido",
        respuesta: "Por favor, escribe un mensaje para continuar.",
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              contexto ||
              "Eres un asistente especializado en sistemas de agua e instalaciones hidráulicas para la empresa 'Instala Óptima'. Ayudas con preguntas sobre sensores ESP32, tinacos, bombas, cotizaciones y instalaciones de agua. Responde de manera profesional y útil en español.",
          },
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

// ✅ Ruta raíz para frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ✅ Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    mensaje: `La ruta ${req.method} ${req.path} no existe en este servidor.`,
  });
});

// ✅ Conexión y arranque del servidor
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
