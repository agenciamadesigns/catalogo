const numeroWhatsApp = "526621668765";

const productos = [
  {
    id: 1,
    nombre: "Sala Moderna Gris",
    categoria: "Muebles",
    precio: 8500,
    imagen: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    descripcion: "Sala elegante de estilo moderno para espacios premium."
  },
  {
    id: 2,
    nombre: "Mesa de Centro",
    categoria: "Muebles",
    precio: 2300,
    imagen: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80",
    descripcion: "Mesa minimalista ideal para sala o recepción."
  },
  {
    id: 3,
    nombre: "Lámpara Decorativa",
    categoria: "Decoración",
    precio: 1250,
    imagen: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    descripcion: "Lámpara elegante para crear ambientes cálidos."
  },
  {
    id: 4,
    nombre: "Silla Premium",
    categoria: "Muebles",
    precio: 1800,
    imagen: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80",
    descripcion: "Silla cómoda con diseño moderno y sofisticado."
  },
  {
    id: 5,
    nombre: "Florero Cerámico",
    categoria: "Decoración",
    precio: 650,
    imagen: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=900&q=80",
    descripcion: "Accesorio decorativo para salas, oficinas o recibidores."
  },
  {
    id: 6,
    nombre: "Bolso Casual",
    categoria: "Accesorios",
    precio: 950,
    imagen: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    descripcion: "Bolso elegante para uso diario."
  }
];

let carrito = [];
let categoriaActual = "Todos";

const contenedorProductos = document.getElementById("productos");
const buscador = document.getElementById("buscador");

function mostrarProductos() {
  const texto = buscador.value.toLowerCase();

  const filtrados = productos.filter(producto => {
    const coincideCategoria = categoriaActual === "Todos" || producto.categoria === categoriaActual;
    const coincideTexto = producto.nombre.toLowerCase().includes(texto);
    return coincideCategoria && coincideTexto;
  });

  contenedorProductos.innerHTML = "";

  filtrados.forEach(producto => {
    contenedorProductos.innerHTML += `
      <div class="card">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="card-content">
          <span>${producto.categoria}</span>
          <h3>${producto.nombre}</h3>
          <p>${producto.descripcion}</p>
          <div class="precio">$${producto.precio.toLocaleString("es-MX")}</div>
          <div class="acciones">
  <a href="producto.html?id=${producto.id}" class="btn-detalle">
    Ver detalles
  </a>

  <button onclick="agregarAlCarrito(${producto.id})">
    Agregar
  </button>
</div>
        </div>
      </div>
    `;
  });
}

function filtrarCategoria(categoria) {
  categoriaActual = categoria;

  document.querySelectorAll(".categorias button").forEach(btn => {
    btn.classList.remove("activo");
  });

  event.target.classList.add("activo");
  mostrarProductos();
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const existe = carrito.find(item => item.id === id);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1
    });
  }

  actualizarCarrito();
  abrirCarrito();
}

function actualizarCarrito() {
  const itemsCarrito = document.getElementById("itemsCarrito");
  const cartCount = document.getElementById("cartCount");
  const totalCarrito = document.getElementById("totalCarrito");

  itemsCarrito.innerHTML = "";

  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;

    itemsCarrito.innerHTML += `
      <div class="item">
        <h4>${item.nombre}</h4>
        <p>$${item.precio.toLocaleString("es-MX")} c/u</p>

        <div class="item-controls">
          <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
          <strong>${item.cantidad}</strong>
          <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
          <button onclick="eliminarProducto(${item.id})">🗑</button>
        </div>
      </div>
    `;
  });

  cartCount.textContent = cantidadTotal;
  totalCarrito.textContent = `$${total.toLocaleString("es-MX")}`;
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(p => p.id === id);

  if (!item) return;

  item.cantidad += cambio;

  if (item.cantidad <= 0) {
    carrito = carrito.filter(p => p.id !== id);
  }

  actualizarCarrito();
}

function eliminarProducto(id) {
  carrito = carrito.filter(p => p.id !== id);
  actualizarCarrito();
}

function abrirCarrito() {
  document.getElementById("carrito").classList.add("activo");
  document.getElementById("overlay").classList.add("activo");
}

function cerrarCarrito() {
  document.getElementById("carrito").classList.remove("activo");
  document.getElementById("overlay").classList.remove("activo");
}

function enviarWhatsApp() {
  if (carrito.length === 0) {
    alert("Agrega productos al pedido.");
    return;
  }

  let mensaje = "Hola, quiero hacer este pedido:%0A%0A";
  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    mensaje += `${index + 1}. ${item.nombre}%0A`;
    mensaje += `Cantidad: ${item.cantidad}%0A`;
    mensaje += `Precio: $${item.precio.toLocaleString("es-MX")}%0A`;
    mensaje += `Subtotal: $${subtotal.toLocaleString("es-MX")}%0A%0A`;
  });

  mensaje += `Total aproximado: $${total.toLocaleString("es-MX")}%0A%0A`;
  mensaje += "Quedo pendiente de la confirmación.";

  const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
  window.open(url, "_blank");
}

buscador.addEventListener("input", mostrarProductos);

mostrarProductos();