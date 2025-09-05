
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const sequelize = require("./config/db");

// ✅ Middlewares esenciales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ✅ RUTA ESP32 - Recibir datos del sensor
app.post("/api/esp32", (req, res) => {
  console.log("📥 Datos recibidos desde ESP32:", req.body);

  const nivel = parseInt(req.body.nivel);
  const dispositivo = req.body.dispositivo || "ESP32";
  const estado = req.body.estado || "desconocido";

  if (isNaN(nivel)) {
    return res.status(400).json({ error: "Nivel inválido" });
  }

  console.log(`📊 Nivel de agua: ${nivel}%, Dispositivo: ${dispositivo}, Estado: ${estado}`);

  // Lógica de control de bomba
  let comando = "esperar";
  if (nivel <= 20) {
    comando = "encender";
  } else if (nivel >= 95) {
    comando = "apagar";
  }

  // Respuesta al ESP32
  res.status(200).json({
    comando: comando,
    nivel: nivel,
    mensaje: `Nivel ${nivel}% - ${comando} bomba`,
    timestamp: new Date().toISOString()
  });
});

// ✅ Ruta GET para pruebas (opcional)
app.get("/api/esp32", (req, res) => {
  const nivel = parseInt(req.query.nivel);
  
  if (isNaN(nivel)) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>API ESP32 - Instala Óptima</title>
        <style>
          body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
          .status { background: #22c55e; color: white; padding: 15px; border-radius: 5px; text-align: center; }
          .test { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <h1>📡 API ESP32 - Instala Óptima</h1>
        <div class="status">✅ Servidor funcionando correctamente</div>
        
        <div class="test">
          <h3>🧪 Prueba la API:</h3>
          <p><strong>Ejemplos:</strong></p>
          <ul>
            <li><a href="/api/esp32?nivel=15">Nivel 15% (debería responder: encender)</a></li>
            <li><a href="/api/esp32?nivel=50">Nivel 50% (debería responder: esperar)</a></li>
            <li><a href="/api/esp32?nivel=98">Nivel 98% (debería responder: apagar)</a></li>
          </ul>
        </div>

        <div class="test">
          <h3>⚙️ Lógica de control:</h3>
          <ul>
            <li><strong>Nivel ≤ 20%:</strong> Encender bomba</li>
            <li><strong>Nivel ≥ 95%:</strong> Apagar bomba</li>
            <li><strong>21% - 94%:</strong> Esperar</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }

  // Respuesta simple para pruebas GET
  let respuesta = "esperar";
  if (nivel <= 20) respuesta = "encender";
  else if (nivel >= 95) respuesta = "apagar";

  console.log(`📊 Nivel GET recibido: ${nivel}% - Respuesta: ${respuesta}`);
  res.send(respuesta);
});

// ✅ Otras rutas API
const nivelRoutes = require("./routes/nivel");
app.use("/api/nivel", nivelRoutes);

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
            content: contexto || "Eres un asistente especializado en sistemas de agua e instalaciones hidráulicas para la empresa 'Instala Óptima'. Ayudas con preguntas sobre sensores ESP32, tinacos, bombas, cotizaciones y instalaciones de agua. Responde de manera profesional y útil en español.",
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
      respuesta: "Lo siento, tengo problemas técnicos temporales. Intenta de nuevo en unos momentos.",
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
const PORT = process.env.PORT || 5000;

// ✅ Conexión y arranque del servidor UltraBase
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ UltraBase (Hetzner) conectada y sincronizada correctamente.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor UltraBase corriendo en puerto ${PORT}`);
      console.log(`📡 API ESP32 disponible en: http://localhost:${PORT}/api/esp32`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar UltraBase:", err);
  });
