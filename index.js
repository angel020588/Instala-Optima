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

// Endpoint para Chat con IA
app.post('/api/chat', async (req, res) => {
  try {
    const { mensaje, contexto } = req.body;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: contexto },
          { role: 'user', content: mensaje }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      res.json({ 
        respuesta: data.choices[0].message.content 
      });
    } else {
      throw new Error('Respuesta inválida de OpenAI');
    }
    
  } catch (error) {
    console.error('❌ Error en chat IA:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      respuesta: 'Lo siento, tengo problemas técnicos temporales. Intenta de nuevo en unos momentos.'
    });
  }
});

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