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
  const nombre = document.getElementById("clienteNombre").value;
  const telefono = document.getElementById("clienteTelefono").value;
  const resumen = document.getElementById("resumen").innerText;
  const total = document.getElementById("precioTotal").textContent;

  const mensaje = `🚿 *Instala DOF - Cotización* \n\n👤 *Cliente:* ${nombre}\n\n${resumen}\n\n💰 *Total:* ${total}`;
  const url = `https://wa.me/52${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

// Guardar en backend (simulado)
function guardarEnUltraBase() {
  const data = {
    nombre: document.getElementById("clienteNombre").value,
    telefono: document.getElementById("clienteTelefono").value,
    resumen: document.getElementById("resumen").innerText,
    total: document.getElementById("precioTotal").textContent,
  };

  fetch("/guardar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => alert("Guardado en UltraBase (simulado)"))
    .catch((err) => console.error("Error al guardar:", err));
}

// FUNCIONES DEL MENÚ LATERAL Y NAVEGACIÓN
function mostrarSeccion(id) {
  document.querySelectorAll('.seccionApp').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// FUNCIONES DE SIMULACIÓN DE TINACO
function simularCambioNivel() {
  const nivel = Math.floor(Math.random() * 100);
  const barra = document.getElementById("nivelTinaco");
  barra.style.height = `${nivel}%`;
  barra.textContent = `${nivel}%`;
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

// NUEVA FUNCIÓN PARA EL CHATBOT SIMPLIFICADO
function responderIA() {
  const input = document.getElementById("inputIA");
  const chat = document.getElementById("chatBot");
  const pregunta = input.value.trim().toLowerCase();

  if (!pregunta) return;

  // Mostrar mensaje del usuario
  chat.innerHTML += `<div class="text-right text-sm text-green-600">🧑 Tú: ${pregunta}</div>`;

  // Respuestas básicas
  let respuesta = "Lo siento, no entendí eso. Intenta preguntar de otra forma.";
  if (pregunta.includes("sensor")) {
    respuesta = "El sensor se coloca en la parte superior del tinaco. Se conecta por cable al ESP32 que va protegido en una caja cerca del tinaco.";
  } else if (pregunta.includes("bomba")) {
    respuesta = "La bomba automática se enciende sola si el agua baja del nivel que tú configures. También puedes encenderla manualmente desde la app.";
  } else if (pregunta.includes("tinaco")) {
    respuesta = "Tenemos varias opciones de instalación. El costo depende de los materiales, pero puedes usar la sección de Cotización para obtener el precio exacto.";
  }

  // Mostrar respuesta
  chat.innerHTML += `<div class="text-sm text-blue-600">🤖 InstalaBot: ${respuesta}</div>`;
  input.value = "";
  chat.scrollTop = chat.scrollHeight;
}