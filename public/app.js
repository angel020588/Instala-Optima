document.addEventListener("DOMContentLoaded", () => {
  calcularPrecio(); // calculamos en cuanto se carga
});

// Precios base de instalación
const preciosBase = {
  tinaco1100: 1200,
  tinaco1200: 1800,
  cisterna3000: 3500,
};

// Función para mostrar sección de tipo cisterna
function mostrarTipoCisterna() {
  const tipo = document.getElementById("tipoInstalacion").value;
  document.getElementById("tipoCisternaSection").style.display =
    tipo === "cisterna3000" ? "block" : "none";
}

// Función para cambiar cantidad
function cambiarCantidad(id, delta) {
  const input = document.getElementById(id);
  let valor = parseInt(input.value) || 0;
  valor = Math.max(0, valor + delta);
  input.value = valor;
  calcularPrecio();
}

// Función para calcular precio total
function calcularPrecio() {
  let total = 0;
  const resumen = [];

  const tipo = document.getElementById("tipoInstalacion").value;
  if (tipo) {
    total += preciosBase[tipo] || 0;
    resumen.push(`🔧 Instalación: ${tipo} - $${preciosBase[tipo]}`);
  }

  const materiales = [
    { id: "tubo4m", input: "cantTubo", precio: 100, nombre: "Tubo PPR" },
    { id: "conexion", input: "cantConexion", precio: 40, nombre: "Conexión" },
    { id: "cople", input: "cantCople", precio: 10, nombre: "Cople" },
    { id: "codo", input: "cantCodo", precio: 12, nombre: "Codo" },
    {
      id: "bombaSencilla",
      input: "cantBombaSencilla",
      precio: 600,
      nombre: "Bomba Sencilla",
    },
    {
      id: "bombaAutomatica",
      input: "cantBombaAutomatica",
      precio: 1000,
      nombre: "Bomba Automática",
    },
  ];

  materiales.forEach((item) => {
    if (document.getElementById(item.id).checked) {
      const cantidad = parseInt(document.getElementById(item.input).value) || 0;
      const subtotal = cantidad * item.precio;
      total += subtotal;
      resumen.push(
        `${item.nombre}: ${cantidad} x $${item.precio} = $${subtotal}`,
      );
    }
  });

  if (document.getElementById("llaves").checked) {
    const val = parseInt(document.getElementById("tipoLlave").value);
    total += val;
    resumen.push(`🔑 Llave: $${val}`);
  }

  if (document.getElementById("tapa").checked) {
    const val = parseInt(document.getElementById("tipoTapa").value);
    total += val;
    resumen.push(`🛡️ Tapa: $${val}`);
  }

  if (document.getElementById("kit").checked) {
    total += 150;
    resumen.push(`🧰 Kit Accesorios: $150`);
  }

  if (document.getElementById("brida").checked) {
    total += 100;
    resumen.push(`🔩 Brida: $100`);
  }

  document.getElementById("precioTotal").textContent = `$${total}`;
  document.getElementById("resumen").innerHTML = resumen.join("<br>");
  return total;
}

// Mostrar fotos
function mostrarFotos() {
  const input = document.getElementById("fotosProyecto");
  const contenedor = document.getElementById("contenedorFotos");
  contenedor.innerHTML = "";
  Array.from(input.files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.className = "photo-item";
      div.innerHTML = `<img src="${e.target.result}" alt="foto" />`;
      contenedor.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

// Simular nivel de agua (valor aleatorio por ahora)
setInterval(() => {
  const nivel = Math.floor(Math.random() * 100);
  const barra = document.getElementById("barraNivel");
  barra.style.height = `${nivel}%`;
  barra.textContent = `${nivel}%`;
}, 5000);

// Generar PDF
async function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Cotización Instala DOF", 10, 10);
  const resumen = document.getElementById("resumen").innerText.split("\n");
  resumen.forEach((linea, i) => doc.text(linea, 10, 20 + i * 7));
  const total = document.getElementById("precioTotal").textContent;
  doc.text(`Total: ${total}`, 10, 20 + resumen.length * 7 + 10);
  doc.save("cotizacion.pdf");
}

// Enviar por WhatsApp
function enviarWhatsApp() {
  const nombre = document.getElementById("clienteNombre").value;
  const telefono = document.getElementById("clienteTelefono").value;
  const direccion = document.getElementById("clienteDireccion").value;
  const total = document.getElementById("precioTotal").textContent;
  const resumen = document.getElementById("resumen").innerText;

  const mensaje = `📋 *Cotización Instala DOF*\n\n👤 *Cliente:* ${nombre}\n📍 *Dirección:* ${direccion}\n\n${resumen}\n\n💰 *Total:* ${total}`;
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

// Guardar en UltraBase (simulado)
function guardarEnUltraBase() {
  const data = {
    nombre: document.getElementById("clienteNombre").value,
    telefono: document.getElementById("clienteTelefono").value,
    direccion: document.getElementById("clienteDireccion").value,
    resumen: document.getElementById("resumen").innerText,
    total: document.getElementById("precioTotal").textContent,
    ubicacion: ubicacionCliente,
  };

  fetch("/guardar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((res) => alert("Cotización guardada con éxito"))
    .catch((err) => console.error("Error al guardar:", err));
}

// Enviar comando de bomba (ON/OFF) al servidor/ESP32
function encenderBomba(estado) {
  const clienteId = "cliente-demo"; // después será dinámico
  fetch(`/api/bomba/${clienteId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ encender: estado })
  })
    .then(res => res.json())
    .then(data => alert(`Bomba ${estado ? "ENCENDIDA" : "APAGADA"}`))
    .catch(err => alert("Error al enviar comando"));
}

// Variable para almacenar ubicación del cliente
let ubicacionCliente = "";

// Función para obtener ubicación del cliente
function obtenerUbicacion() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        ubicacionCliente = `${latitude},${longitude}`;
        document.getElementById("ubicacionText").textContent = `Ubicación registrada: ${ubicacionCliente}`;
      },
      () => alert("No se pudo obtener ubicación.")
    );
  } else {
    alert("Navegador no soporta geolocalización");
  }
}

// FUNCIONES DEL MENÚ LATERAL Y NAVEGACIÓN
function mostrarSeccion(id) {
  document.querySelectorAll('.seccionApp').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// FUNCIONES DE SIMULACIÓN DE TINACO
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
  
  aguaTinaco.style.height = `${porcentaje}%`;
  porcentajeTinaco.textContent = `${porcentaje}%`;
  litrosActuales.textContent = Math.round(1200 * porcentaje / 100);
  
  // Actualizar estado de la bomba
  if (porcentaje < 30) {
    estadoBomba.textContent = "Encendida (Auto)";
    estadoBomba.className = "text-green-600 font-semibold";
  } else {
    estadoBomba.textContent = "Apagada";
    estadoBomba.className = "text-gray-600";
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
