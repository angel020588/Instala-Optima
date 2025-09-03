const express = require('express');
const router = express.Router();
const Cotizacion = require('../models/Cotizacion');

// Guardar nueva cotización
router.post('/guardar', async (req, res) => {
  try {
    const { folio, fecha, nombreCliente, telefono, ubicacion, productos, manoObra, total } = req.body;
    
    console.log(`📥 Nueva cotización recibida - Folio: ${folio}`);
    
    const nueva = await Cotizacion.create({
      folio,
      fecha,
      nombreCliente,
      telefono,
      ubicacion,
      productos,
      manoObra,
      total
    });

    console.log(`✅ Cotización ${folio} guardada en UltraBase`);
    
    res.status(201).json({ 
      mensaje: "✅ Cotización guardada correctamente en UltraBase",
      data: nueva
    });
    
  } catch (error) {
    console.error('❌ Error al guardar en UltraBase:', error.message);
    res.status(500).json({ 
      mensaje: "❌ Error al guardar en UltraBase",
      error: error.message 
    });
  }
});

// Obtener todas las cotizaciones
router.get('/todas', async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      mensaje: `📋 ${cotizaciones.length} cotizaciones encontradas en UltraBase`,
      data: cotizaciones
    });
    
  } catch (error) {
    console.error('❌ Error al consultar UltraBase:', error.message);
    res.status(500).json({ 
      mensaje: "❌ Error al consultar UltraBase",
      error: error.message 
    });
  }
});

// Obtener cotización por folio
router.get('/:folio', async (req, res) => {
  try {
    const { folio } = req.params;
    
    const cotizacion = await Cotizacion.findOne({ where: { folio } });
    
    if (!cotizacion) {
      return res.status(404).json({ 
        mensaje: `❌ Cotización ${folio} no encontrada en UltraBase`
      });
    }
    
    res.json({
      mensaje: `✅ Cotización ${folio} encontrada en UltraBase`,
      data: cotizacion
    });
    
  } catch (error) {
    console.error('❌ Error al buscar en UltraBase:', error.message);
    res.status(500).json({ 
      mensaje: "❌ Error al buscar en UltraBase",
      error: error.message 
    });
  }
});

module.exports = router;