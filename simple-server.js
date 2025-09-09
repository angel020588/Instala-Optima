
const express = require('express');
const app = express();
const sequelize = require('./config/db');

const PORT = process.env.PORT || 8080;

// Middleware básico
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('🚀 Instala Óptima corriendo en Replit Deployment');
});

// Health check obligatorio
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Conexión a UltraBase con manejo de errores
sequelize.authenticate()
  .then(() => {
    console.log('✅ UltraBase conectada');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    // IMPORTANTE: bind a 0.0.0.0 para deployment
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error UltraBase:', err.message);
    // Iniciar servidor sin BD para evitar fallos de deployment
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Servidor iniciado SIN BD en puerto ${PORT}`);
    });
  });
