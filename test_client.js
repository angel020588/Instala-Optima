
// Script de prueba para verificar el endpoint /api/nivel/
const testNivelEndpoint = async () => {
  try {
    const response = await fetch('https://instala-optima-ecotisat.replit.app/api/nivel/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "dispositivo": "esp32_001",
        "porcentaje": 42,
        "estado_bomba": "ENCENDIDA"
      })
    });

    const result = await response.json();
    console.log('✅ Respuesta del servidor:', result);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Ejecutar prueba
testNivelEndpoint();
