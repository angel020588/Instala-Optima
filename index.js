require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const sequelize = require("./config/db");

// ✅ Middlewares esenciales
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// ✅ Evitar caché
app.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

// ✅ Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// ✅ Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ✅ Ruta de salud para los health checks
app.get("/ping", (req, res) => res.status(200).send("pong"));

// ✅ CONECTAR RUTA ESP32 (usando el router separado)
const esp32Router = require("./routes/esp32");
app.use("/api/esp32", esp32Router);

// ✅ Otras rutas API
const nivelRoutes = require("./routes/nivel");
app.use("/api/nivel", nivelRoutes);

const relayRoutes = require("./routes/relays");
app.use("/api/relays", relayRoutes);

const cotizaciones = require("./routes/cotizaciones");
app.use("/api/cotizaciones", cotizaciones);

// ✅ Ruta de Chat IA
app.post("/api/chat", async (req, res) => {
  try {
    const { mensaje, contexto } = req.body;

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

// ✅ Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    mensaje: `La ruta ${req.method} ${req.path} no existe en este servidor.`,
  });
});

// ✅ Configuración del puerto
const PORT = process.env.PORT || 8080;

// ✅ Conexión y arranque del servidor UltraBase
console.log('🔄 Conectando a UltraBase...');
console.log('🔍 Variables de entorno:', {
  DATABASE_URL: process.env.DATABASE_URL ? '✅ Configurada' : '❌ Faltante',
  API_KEY_ULTRABASE: process.env.API_KEY_ULTRABASE ? '✅ Configurada' : '❌ Faltante',
  API_KEY_HETZNER: process.env.API_KEY_HETZNER ? '✅ Configurada' : '❌ Faltante'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ UltraBase conectada correctamente');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("✅ UltraBase sincronizada correctamente");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Instala Óptima corriendo en puerto ${PORT}`);
      console.log(`📡 API ESP32: /api/esp32`);
      console.log(`📊 Panel Web: /`);
      console.log(`💾 UltraBase: Operativa`);
      console.log(`✅ Health Check: /ping`);
    });
  })
  .catch((err) => {
    console.error("❌ Error UltraBase:", err.message);
    console.log("🔄 Iniciando en modo seguro...");
    
    // Arrancar servidor sin base de datos en caso de error
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Instala Óptima corriendo en puerto ${PORT} (MODO SEGURO)`);
      console.log(`📡 API ESP32: /api/esp32`);
      console.log(`📊 Panel Web: /`);
      console.log(`⚠️  UltraBase: Desconectada`);
      console.log(`✅ Health Check: /ping`);
    });
  });
