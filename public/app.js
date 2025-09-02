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
