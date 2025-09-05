document.addEventListener("DOMContentLoaded", () => {
  calcularPrecio();
});

// Valores base
const precios = {
  tinaco1100: 1200,
  tinaco1200: 1800,
  cisterna3000: 3500,
  tubo4m: 100,
  conexion: 40,
  cople: 10,
  bombaAutomatica: 1000,
};

// Calcula precio total y genera resumen
function calcularPrecio() {
  let total = 0;
  let resumen = [];

  const tipo = document.getElementById("tipoInstalacion").value;
  if (tipo && precios[tipo]) {
    total += precios[tipo];
    resumen.push(`🔧 Instalación: $${precios[tipo]}`);
  }

  ["tubo4m", "conexion", "cople", "bombaAutomatica"].forEach((id) => {
    const checkbox = document.getElementById(id);
    if (checkbox && checkbox.checked) {
      total += precios[id];
      resumen.push(`✔️ ${id} - $${precios[id]}`);
    }
  });

  document.getElementById("precioTotal").textContent = `$${total}`;
  document.getElementById("resumen").innerHTML = resumen.join("<br>");
}

// Genera PDF con jsPDF
function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const nombre = document.getElementById("clienteNombre").value;
  const tel = document.getElementById("clienteTelefono").value;
  const resumen = document.getElementById("resumen").innerText;
  const total = document.getElementById("precioTotal").textContent;

  doc.text("Instala DOF - Cotización", 10, 10);
  doc.text(`Cliente: ${nombre}`, 10, 20);
  doc.text(`WhatsApp: ${tel}`, 10, 30);
  doc.text("Resumen:", 10, 40);

  resumen.split("\n").forEach((line, i) => {
    doc.text(line, 10, 50 + i * 10);
  });

  doc.text(`Total: ${total}`, 10, 70 + resumen.split("\n").length * 10);
  doc.save("cotizacion_instala_dof.pdf");
}

// Enviar WhatsApp
function enviarWhatsApp() {
  const nombreElement = document.getElementById("clienteNombre");
  const telefonoElement = document.getElementById("clienteTelefono");
  const resumenElement = document.getElementById("resumen");
  const totalElement = document.getElementById("precioTotal");

  if (!nombreElement || !telefonoElement || !resumenElement || !totalElement) {
    alert('Error: Datos del formulario no disponibles');
    return;
  }

  const nombre = nombreElement.value;
  const telefono = telefonoElement.value;
  const resumen = resumenElement.innerText;
  const total = totalElement.textContent;

  const mensaje = `🚿 *Instala DOF - Cotización* \n\n👤 *Cliente:* ${nombre}\n\n${resumen}\n\n💰 *Total:* ${total}`;
  const url = `https://wa.me/52${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

// Guardar en UltraBase
async function guardarEnUltraBase() {
  try {
    // Obtener elementos del formulario con validación
    const nombreElement = document.getElementById('clienteNombre');
    const telefonoElement = document.getElementById('clienteTelefono');
    const ubicacionElement = document.getElementById('ubicacion');

    if (!nombreElement || !telefonoElement || !ubicacionElement) {
      console.error('Elementos del formulario no encontrados');
      alert('Error: Formulario no disponible');
      return;
    }

    const nombre = nombreElement.value;
    const telefono = telefonoElement.value;
    const ubicacion = ubicacionElement.value;

    if (!nombre) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }

    // Calcular productos y total
    const inputs = document.querySelectorAll('input[type="number"][data-precio]');
    const manoObra = document.getElementById('manoObra').checked;
    let productos = [];
    let total = 0;

    inputs.forEach(input => {
      const cantidad = parseInt(input.value) || 0;
      if (cantidad > 0) {
        const precio = parseInt(input.dataset.precio);
        const subtotal = cantidad * precio;
        total += subtotal;
        const nombreProducto = input.previousElementSibling.textContent.split(' - ')[0];

        productos.push({
          nombre: nombreProducto,
          precio: precio,
          cantidad: cantidad,
          subtotal: subtotal
        });
      }
    });

    if (manoObra) {
      total += 750;
      productos.push({
        nombre: 'Mano de obra',
        precio: 750,
        cantidad: 1,
        subtotal: 750
      });
    }

    const datosCompletos = {
      folio: folio,
      fecha: fecha,
      nombreCliente: nombre,
      telefono: telefono,
      ubicacion: ubicacion,
      productos: productos,
      manoObra: manoObra,
      total: total
    };

    const response = await fetch('/api/cotizaciones/guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosCompletos)
    });

    const resultado = await response.json();
    console.log('✅ Guardado en UltraBase:', resultado);

    if (response.ok) {
      alert(`✅ Cotización ${folio} guardada correctamente en UltraBase`);
    } else {
      throw new Error(resultado.mensaje || 'Error al guardar');
    }
  } catch (error) {
    console.error('Error al guardar:', error);
    alert('❌ Error al guardar en UltraBase');
  }
}

// FUNCIONES DEL MENÚ LATERAL Y NAVEGACIÓN
function mostrarSeccion(id) {
  document.querySelectorAll('.seccionApp').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// FUNCIONES DE SIMULACIÓN DE TINACO
function simularCambioNivel() {
  const nivel = Math.floor(Math.random() * 100);
  const agua = document.getElementById("aguaTinaco");
  const texto = document.getElementById("textoNivel");

  agua.style.height = `${nivel}%`;
  texto.textContent = `${nivel}%`;

  // Cambiar color según el nivel
  if (nivel < 25) {
    agua.classList.remove("bg-blue-500", "bg-yellow-400");
    agua.classList.add("bg-red-500");
  } else if (nivel < 50) {
    agua.classList.remove("bg-blue-500", "bg-red-500");
    agua.classList.add("bg-yellow-400");
  } else {
    agua.classList.remove("bg-yellow-400", "bg-red-500");
    agua.classList.add("bg-blue-500");
  }
}

function simularLlenado() {
  let nivelActual = parseInt(document.getElementById('aguaTinaco').style.height) || 45;
  nivelActual = Math.min(100, nivelActual + 15);
  actualizarTinaco(nivelActual);
}

function simularVaciado() {
  let nivelActual = parseInt(document.getElementById('aguaTinaco').style.height) || 45;
  nivelActual = Math.max(0, nivelActual - 15);
  actualizarTinaco(nivelActual);
}

function actualizarTinaco(porcentaje) {
  const aguaTinaco = document.getElementById('aguaTinaco');
  const porcentajeTinaco = document.getElementById('porcentajeTinaco');
  const litrosActuales = document.getElementById('litrosActuales');
  const estadoBomba = document.getElementById('estadoBomba');

  if (aguaTinaco) {
    aguaTinaco.style.height = `${porcentaje}%`;
  }
  if (porcentajeTinaco) {
    porcentajeTinaco.textContent = `${porcentaje}%`;
  }
  if (litrosActuales) {
    litrosActuales.textContent = Math.round(1200 * porcentaje / 100);
  }

  // Actualizar estado de la bomba
  if (estadoBomba) {
    if (porcentaje < 30) {
      estadoBomba.textContent = "Encendida (Auto)";
      estadoBomba.className = "text-green-600 font-semibold";
    } else {
      estadoBomba.textContent = "Apagada";
      estadoBomba.className = "text-gray-600";
    }
  }
}

// FUNCIONES DEL SENSOR
function configurarWifi() {
  const wifiName = document.getElementById('wifiName').value;
  const wifiPass = document.getElementById('wifiPass').value;

  if (!wifiName || !wifiPass) {
    alert('Por favor completa ambos campos');
    return;
  }

  // Simular configuración
  alert(`Configurando WiFi "${wifiName}"...`);
  setTimeout(() => {
    alert('¡WiFi configurado exitosamente!');
    document.getElementById('estadoSensor').textContent = 'Conectado';
    document.getElementById('senalWifi').textContent = '-42 dBm';
  }, 2000);
}

// FUNCIONES DEL CONTROL DE BOMBA
function encenderBomba(estado) {
  const estadoTexto = estado ? "Encendida" : "Apagada";
  const color = estado ? "text-green-600" : "text-red-600";
  const div = document.getElementById("estadoBomba");

  div.textContent = estadoTexto;
  div.className = "text-lg font-bold " + color;

  // Aquí puedes agregar una llamada real al ESP32 si ya está conectado
  // Ejemplo:
  // fetch(`/api/bomba`, { method: "POST", body: JSON.stringify({ encender: estado }) })

  console.log(`Bomba ${estado ? "ENCENDIDA" : "APAGADA"}`);
}

function actualizarUmbral() {
  const umbral = document.getElementById('umbralEncendido').value;
  document.getElementById('valorUmbral').textContent = `${umbral}%`;
}

function guardarConfigBomba() {
  const umbral = document.getElementById('umbralEncendido').value;
  const tiempo = document.getElementById('tiempoMax').value;
  alert(`Configuración guardada: Encender al ${umbral}%, máximo ${tiempo} minutos`);
}

// FUNCIONES DEL CHATBOT
function enviarMensaje() {
  const input = document.getElementById('chatInput');
  const mensaje = input.value.trim();

  if (!mensaje) return;

  // Agregar mensaje del usuario
  agregarMensajeChat('Usuario', mensaje, 'bg-gray-100');
  input.value = '';

  // Simular respuesta del bot
  setTimeout(() => {
    const respuesta = generarRespuestaBot(mensaje);
    agregarMensajeChat('Bot', respuesta, 'bg-blue-100');
  }, 1000);
}

function preguntaRapida(pregunta) {
  document.getElementById('chatInput').value = pregunta;
  enviarMensaje();
}

function agregarMensajeChat(remitente, mensaje, claseCSS) {
  const chatMessages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `${claseCSS} p-3 rounded-lg mb-2`;
  div.innerHTML = `<strong>${remitente}:</strong> ${mensaje}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generarRespuestaBot(mensaje) {
  const mensajeLower = mensaje.toLowerCase();

  if (mensajeLower.includes('sensor')) {
    return 'El sensor ESP32 mide el nivel de agua cada 10 segundos y envía los datos por WiFi. Es completamente inalámbrico y tiene batería para 6 meses.';
  } else if (mensajeLower.includes('costo') || mensajeLower.includes('precio')) {
    return 'El costo varía según el tipo de instalación: Tinaco 1100L desde $1,200, Tinaco 1200L desde $1,800, Cisterna 3000L desde $3,500. ¡Usa nuestro cotizador para un precio exacto!';
  } else if (mensajeLower.includes('garantía')) {
    return 'Sí, incluimos garantía de 2 años en equipos y 1 año en instalación. También ofrecemos soporte técnico 24/7 y mantenimiento preventivo.';
  } else if (mensajeLower.includes('internet')) {
    return 'Sí, necesitas conexión WiFi para que el sensor envíe datos y recibir alertas. El consumo de datos es mínimo: menos de 1MB al mes.';
  } else {
    return 'Gracias por tu pregunta. Te puedo ayudar con información sobre sensores, precios, garantías, instalación, y funcionamiento del sistema. ¿Qué te interesa saber específicamente?';
  }
}

// NUEVA FUNCIÓN PARA EL CHATBOT CON IA REAL
async function responderIA() {
  const input = document.getElementById("inputIA");
  const chat = document.getElementById("chatBot");

  if (!input || !chat) {
    console.error("Elementos del chat no encontrados");
    return;
  }

  const pregunta = input.value.trim();

  if (!pregunta) return;

  // Mostrar mensaje del usuario
  chat.innerHTML += `<div class="text-right text-sm text-green-600">🧑 Tú: ${pregunta}</div>`;

  // Mostrar indicador de carga
  chat.innerHTML += `<div class="text-sm text-blue-600" id="loading-msg">🤖 InstalaBot: Escribiendo...</div>`;
  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  try {
    // Llamar a la API de OpenAI a través del backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        mensaje: pregunta,
        contexto: "Eres un asistente especializado en sistemas de agua e instalaciones hidráulicas para la empresa 'Instala Óptima'. Ayudas con preguntas sobre sensores ESP32, tinacos, bombas, cotizaciones y instalaciones de agua. Responde de manera profesional y útil en español."
      })
    });

    const data = await response.json();

    // Remover indicador de carga
    const loadingMsg = document.getElementById("loading-msg");
    if (loadingMsg) {
      loadingMsg.remove();
    }

    // Mostrar respuesta de la IA
    chat.innerHTML += `<div class="text-sm text-blue-600">🤖 InstalaBot: ${data.respuesta}</div>`;

  } catch (error) {
    console.error('Error al consultar IA:', error);

    // Remover indicador de carga
    const loadingMsg = document.getElementById("loading-msg");
    if (loadingMsg) {
      loadingMsg.remove();
    }

    // Respuesta de fallback
    chat.innerHTML += `<div class="text-sm text-blue-600">🤖 InstalaBot: Lo siento, tengo problemas técnicos. Puedes preguntar sobre sensores, bombas, tinacos o cotizaciones y te ayudo con información básica.</div>`;
  }

  chat.scrollTop = chat.scrollHeight;
}