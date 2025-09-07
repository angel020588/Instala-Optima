
// Script de prueba para verificar el endpoint /api/nivel/
const testNivelEndpoint = async () => {
  console.log('🧪 Iniciando pruebas del endpoint /api/nivel/');
  
  // ✅ Prueba 1: Datos válidos
  console.log('\n1️⃣ Probando datos válidos...');
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

  // ❌ Prueba 2: Datos incompletos
  console.log('\n2️⃣ Probando datos incompletos...');
  try {
    const response = await fetch('https://instala-optima-ecotisat.replit.app/api/nivel/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "dispositivo": "esp32_001"
        // Faltan porcentaje y estado_bomba
      })
    });

    const result = await response.json();
    console.log('📝 Validación esperada:', result);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // ❌ Prueba 3: Porcentaje inválido
  console.log('\n3️⃣ Probando porcentaje fuera de rango...');
  try {
    const response = await fetch('https://instala-optima-ecotisat.replit.app/api/nivel/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "dispositivo": "esp32_001",
        "porcentaje": 150, // Fuera de rango
        "estado_bomba": "ENCENDIDA"
      })
    });

    const result = await response.json();
    console.log('📝 Validación esperada:', result);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Ejecutar pruebas
testNivelEndpoint();
