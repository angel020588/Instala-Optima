const express = require("express");
const router = express.Router();

// ===========================
// 📡 Ruta POST (principal para ESP32)
// ===========================
router.post("/", (req, res) => {
  const nivel = parseInt(req.body.nivel);
  const dispositivo = req.body.dispositivo || "ESP32";

  if (isNaN(nivel)) {
    return res.status(400).json({ error: "Nivel inválido" });
  }

  console.log(
    "📡 Nivel POST recibido:",
    nivel + "% | Dispositivo:",
    dispositivo,
  );

  let comando = "esperar";

  if (nivel <= 20) {
    comando = "encender";
  } else if (nivel >= 95) {
    comando = "apagar";
  }

  return res.json({
    comando,
    nivel,
    mensaje: `Nivel ${nivel}% - ${comando} bomba`,
  });
});

// ===========================
// 🌐 Ruta GET (para pruebas manuales en navegador)
// ===========================
router.get("/", (req, res) => {
  const nivel = parseInt(req.query.nivel);

  // Si no hay parámetro nivel, mostrar página de prueba
  if (isNaN(nivel)) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API ESP32 - Instala Óptima</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            background-color: #1a1a1a;
            color: #fff;
          }
          .container { 
            background: #2d2d2d; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          }
          h1 { color: #06b6d4; text-align: center; }
          .status { 
            background: #22c55e; 
            color: white; 
            padding: 10px; 
            border-radius: 5px; 
            text-align: center;
            margin: 20px 0;
          }
          .example { 
            background: #374151; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0;
          }
          code { 
            background: #1f2937; 
            padding: 2px 6px; 
            border-radius: 3px; 
          }
          input, button {
            padding: 10px;
            margin: 5px;
            border: none;
            border-radius: 5px;
          }
          button {
            background: #06b6d4;
            color: white;
            cursor: pointer;
          }
          button:hover { background: #0891b2; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📡 API ESP32 - Instala Óptima</h1>
          
          <div class="status">
            ✅ Servidor funcionando correctamente
          </div>
          
          <h3>🧪 Prueba la API:</h3>
          <input type="number" id="nivelTest" placeholder="Nivel %" min="0" max="100" value="50">
          <button onclick="probarAPI()">Probar</button>
          <div id="resultado" style="margin-top: 15px;"></div>
          
          <h3>📝 Ejemplos de uso:</h3>
          
          <div class="example">
            <strong>GET con parámetro:</strong><br>
            <code>GET /api/esp32?nivel=30</code><br>
            <small>Respuesta: "encender" (si nivel ≤ 20%)</small>
          </div>
          
          <div class="example">
            <strong>POST desde ESP32:</strong><br>
            <code>POST /api/esp32</code><br>
            <code>Content-Type: application/x-www-form-urlencoded</code><br>
            <code>Body: nivel=30</code><br>
            <small>Respuesta JSON con comando</small>
          </div>
          
          <h3>⚙️ Lógica de control:</h3>
          <ul>
            <li><strong>Nivel ≤ 20%:</strong> Encender bomba</li>
            <li><strong>Nivel ≥ 95%:</strong> Apagar bomba</li>
            <li><strong>21% - 94%:</strong> Esperar</li>
          </ul>
        </div>
        
        <script>
          function probarAPI() {
            const nivel = document.getElementById('nivelTest').value;
            if (!nivel || nivel < 0 || nivel > 100) {
              alert('Ingresa un nivel válido (0-100)');
              return;
            }
            
            fetch('/api/esp32?nivel=' + nivel)
              .then(res => res.text())
              .then(data => {
                document.getElementById('resultado').innerHTML = 
                  '<div style="background: #22c55e; padding: 10px; border-radius: 5px; margin-top: 10px;">' +
                  '<strong>Nivel ' + nivel + '%:</strong> ' + data.toUpperCase() + '</div>';
              })
              .catch(err => {
                document.getElementById('resultado').innerHTML = 
                  '<div style="background: #ef4444; padding: 10px; border-radius: 5px; margin-top: 10px;">' +
                  'Error: ' + err + '</div>';
              });
          }
        </script>
      </body>
      </html>
    `);
  }

  console.log("📡 Nivel GET recibido:", nivel + "%");

  if (nivel <= 20) {
    return res.send("encender");
  } else if (nivel >= 95) {
    return res.send("apagar");
  } else {
    return res.send("esperar");
  }
});

module.exports = router;
