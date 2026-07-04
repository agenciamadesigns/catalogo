const numeroWhatsApp = "526621668765";

let productos = [];
let carrito = [];
let categoriaActual = "Todos";

const contenedorProductos = document.getElementById("productos");
const buscador = document.getElementById("buscador");

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();

  if (buscador) {
    buscador.addEventListener("input", mostrarProductos);
  }
});

async function cargarProductos() {
  const { data, error } = await supabaseClient
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    contenedorProductos.innerHTML = "<p>Error al cargar productos.</p>";
    return;
  }

  productos = data || [];
  mostrarCategorias();
  mostrarProductos();
}

function mostrarProductos() {
  const texto = buscador ? buscador.value.toLowerCase() : "";

  const filtrados = productos.filter(producto => {
    const coincideCategoria =
      categoriaActual === "Todos" || producto.categoria === categoriaActual;

    const coincideTexto =
      producto.nombre.toLowerCase().includes(texto);

    return coincideCategoria && coincideTexto;
  });

  contenedorProductos.innerHTML = "";

  if (filtrados.length === 0) {
    contenedorProductos.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  filtrados.forEach(producto => {
    contenedorProductos.innerHTML += `
      <div class="card">
        <img src="${producto.imagen_principal}" alt="${producto.nombre}">

        <div class="card-content">
          <span>${producto.categoria || "General"}</span>
          <h3>${producto.nombre}</h3>
          <p>${producto.descripcion_corta || ""}</p>

          <div class="precio">
            $${Number(producto.precio).toLocaleString("es-MX")}
          </div>

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

function filtrarCategoria(categoria, event) {
  categoriaActual = categoria;

  document.querySelectorAll(".categorias button").forEach(btn => {
    btn.classList.remove("activo");
  });

  if (event && event.target) {
    event.target.classList.add("activo");
  }

  mostrarProductos();
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);

  if (!producto) return;

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

  if (!itemsCarrito || !cartCount || !totalCarrito) return;

  itemsCarrito.innerHTML = "";

  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach(item => {
    total += Number(item.precio) * item.cantidad;
    cantidadTotal += item.cantidad;

    itemsCarrito.innerHTML += `
      <div class="item">
        <h4>${item.nombre}</h4>
        <p>$${Number(item.precio).toLocaleString("es-MX")} c/u</p>

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
  document.getElementById("carrito")?.classList.add("activo");
  document.getElementById("overlay")?.classList.add("activo");
}

function cerrarCarrito() {
  document.getElementById("carrito")?.classList.remove("activo");
  document.getElementById("overlay")?.classList.remove("activo");
}

function enviarWhatsApp() {
  if (carrito.length === 0) {
    alert("Agrega productos al pedido.");
    return;
  }

  let mensaje = "Hola, quiero hacer este pedido:%0A%0A";
  let total = 0;

  carrito.forEach((item, index) => {
    const subtotal = Number(item.precio) * item.cantidad;
    total += subtotal;

    mensaje += `${index + 1}. ${item.nombre}%0A`;
    mensaje += `Cantidad: ${item.cantidad}%0A`;
    mensaje += `Precio: $${Number(item.precio).toLocaleString("es-MX")}%0A`;
    mensaje += `Subtotal: $${subtotal.toLocaleString("es-MX")}%0A%0A`;
  });

  mensaje += `Total aproximado: $${total.toLocaleString("es-MX")}%0A%0A`;
  mensaje += "Quedo pendiente de la confirmación.";

  const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
  window.open(url, "_blank");
}

function mostrarCategorias() {
  const contenedorCategorias = document.getElementById("categorias");

  if (!contenedorCategorias) return;

  const categoriasUnicas = [
    "Todos",
    ...new Set(productos.map(p => p.categoria).filter(Boolean))
  ];

  contenedorCategorias.innerHTML = "";

  categoriasUnicas.forEach(categoria => {
    contenedorCategorias.innerHTML += `
      <button 
        onclick="filtrarCategoria('${categoria}', event)" 
        class="${categoria === categoriaActual ? "activo" : ""}">
        ${categoria}
      </button>
    `;
  });
}