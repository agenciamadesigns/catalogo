let productosAdmin = [];
let imagenPrincipalActual = "";
let imagenesActuales = [];

const loginAdmin = document.getElementById("loginAdmin");
const panelAdmin = document.getElementById("panelAdmin");
const formProducto = document.getElementById("formProducto");
const buscadorAdmin = document.getElementById("buscadorAdmin");

document.addEventListener("DOMContentLoaded", revisarSesion);

if (buscadorAdmin) {
  buscadorAdmin.addEventListener("input", mostrarProductosAdmin);
}

async function revisarSesion() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    loginAdmin.classList.add("oculto");
    panelAdmin.classList.remove("oculto");
    cargarProductosAdmin();
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Correo o contraseña incorrectos");
    console.error(error);
    return;
  }

  loginAdmin.classList.add("oculto");
  panelAdmin.classList.remove("oculto");
  cargarProductosAdmin();
}

async function logout() {
  await supabaseClient.auth.signOut();
  location.reload();
}

async function subirArchivo(file) {
  if (!file) return "";

  const extension = file.name.split(".").pop();
const nombreLimpio = file.name
  .toLowerCase()
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9.-]/g, "");

const nombreArchivo = `${Date.now()}-${nombreLimpio}.${extension}`;

  const { error } = await supabaseClient.storage
    .from("productos")
    .upload(nombreArchivo, file);

  if (error) {
    console.error(error);
    alert("Error al subir imagen");
    return "";
  }

  const { data } = supabaseClient.storage
    .from("productos")
    .getPublicUrl(nombreArchivo);

  return data.publicUrl;
}

async function subirGaleria(files) {
  const urls = [];

  for (const file of files) {
    const url = await subirArchivo(file);
    if (url) urls.push(url);
  }

  return urls;
}

formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productoId = document.getElementById("productoId").value;

  const archivoPrincipal = document.getElementById("imagenPrincipal").files[0];
  const archivosGaleria = document.getElementById("imagenesGaleria").files;

  let imagenPrincipal = imagenPrincipalActual;

  if (archivoPrincipal) {
    imagenPrincipal = await subirArchivo(archivoPrincipal);
  }

  let imagenes = imagenesActuales;

  if (archivosGaleria.length > 0) {
    imagenes = await subirGaleria(archivosGaleria);
  }

  const producto = {
    nombre: document.getElementById("nombre").value,
    categoria: document.getElementById("categoria").value,
    precio: Number(document.getElementById("precio").value),
    descripcion_corta: document.getElementById("descripcion_corta").value,
    descripcion_larga: document.getElementById("descripcion_larga").value,
    material: document.getElementById("material").value,
    color: document.getElementById("color").value,
    medidas: document.getElementById("medidas").value,
    disponibilidad: document.getElementById("disponibilidad").value,

    beneficios: document.getElementById("beneficios").value
    .split("\n")
    .map(b => b.trim())
    .filter(b => b !== ""),   

    imagen_principal: imagenPrincipal,
    imagenes: imagenes,
    activo: document.getElementById("activo").checked
  };

  if (!imagenPrincipal) {
    alert("Sube una imagen principal");
    return;
  }

  let respuesta;

  if (productoId) {
    respuesta = await supabaseClient
      .from("productos")
      .update(producto)
      .eq("id", productoId);
  } else {
    respuesta = await supabaseClient
      .from("productos")
      .insert([producto]);
  }

  if (respuesta.error) {
    console.error(respuesta.error);
    alert("Error al guardar producto");
    return;
  }

  alert("Producto guardado correctamente");
  limpiarFormulario();
  cargarProductosAdmin();
});

async function cargarProductosAdmin() {
  const { data, error } = await supabaseClient
    .from("productos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  productosAdmin = data;
  mostrarProductosAdmin();
}

function mostrarProductosAdmin() {
  const lista = document.getElementById("listaProductosAdmin");
  const texto = buscadorAdmin ? buscadorAdmin.value.toLowerCase() : "";

  lista.innerHTML = "";

  const productosFiltrados = productosAdmin.filter(producto => {
    const nombre = producto.nombre ? producto.nombre.toLowerCase() : "";
    const categoria = producto.categoria ? producto.categoria.toLowerCase() : "";
    const precio = producto.precio ? String(producto.precio) : "";

    return (
      nombre.includes(texto) ||
      categoria.includes(texto) ||
      precio.includes(texto)
    );
  });

  if (productosFiltrados.length === 0) {
    lista.innerHTML = `
      <div class="sin-productos">
        No se encontraron productos.
      </div>
    `;
    return;
  }

  productosFiltrados.forEach(producto => {
    lista.innerHTML += `
      <div class="producto-admin-card">
        <img src="${producto.imagen_principal}" alt="${producto.nombre}">

        <div>
          <h3>${producto.nombre}</h3>
          <p>${producto.categoria}</p>
          <strong>$${Number(producto.precio).toLocaleString("es-MX")}</strong>
          <span class="${producto.activo ? "estado-activo" : "estado-inactivo"}">
            ${producto.activo ? "Activo" : "Oculto"}
          </span>
        </div>

        <div class="acciones-admin">
          <button onclick="editarProducto(${producto.id})">Editar</button>
          <button onclick="toggleProducto(${producto.id}, ${producto.activo})">
            ${producto.activo ? "Ocultar" : "Activar"}
          </button>
          <button class="eliminar" onclick="eliminarProductoAdmin(${producto.id})">Eliminar</button>
        </div>
      </div>
    `;
  });
}

function editarProducto(id) {
  const producto = productosAdmin.find(p => p.id === id);

  document.getElementById("productoId").value = producto.id;
  document.getElementById("nombre").value = producto.nombre || "";
  document.getElementById("categoria").value = producto.categoria || "";
  document.getElementById("precio").value = producto.precio || "";
  document.getElementById("descripcion_corta").value = producto.descripcion_corta || "";
  document.getElementById("descripcion_larga").value = producto.descripcion_larga || "";
  document.getElementById("material").value = producto.material || "";
  document.getElementById("color").value = producto.color || "";
  document.getElementById("medidas").value = producto.medidas || "";
  document.getElementById("disponibilidad").value = producto.disponibilidad || "";
  document.getElementById("beneficios").value = producto.beneficios
  ? producto.beneficios.join("\n")
  : "";
  document.getElementById("activo").checked = producto.activo;

  imagenPrincipalActual = producto.imagen_principal || "";
  imagenesActuales = producto.imagenes || [];

  document.getElementById("tituloForm").textContent = "Editar producto";
  document.getElementById("btnGuardar").textContent = "Actualizar producto";
  document.querySelector(".btn-cancelar").classList.remove("oculto");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function cancelarEdicion() {
  limpiarFormulario();
}

function limpiarFormulario() {
  formProducto.reset();

  document.getElementById("productoId").value = "";
  document.getElementById("tituloForm").textContent = "Nuevo producto";
  document.getElementById("btnGuardar").textContent = "Guardar producto";
  document.querySelector(".btn-cancelar").classList.add("oculto");

  imagenPrincipalActual = "";
  imagenesActuales = [];
}

async function toggleProducto(id, activoActual) {
  const { error } = await supabaseClient
    .from("productos")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al cambiar estado");
    return;
  }

  cargarProductosAdmin();
}

async function eliminarProductoAdmin(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este producto?");

  if (!confirmar) return;

  const { error } = await supabaseClient
    .from("productos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Error al eliminar producto");
    return;
  }

  cargarProductosAdmin();
}

async function cargarExcelProductos() {
  const input = document.getElementById("excelProductos");
  const file = input.files[0];

  if (!file) {
    alert("Selecciona un archivo Excel.");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json(hoja);

    if (filas.length === 0) {
      alert("El Excel está vacío.");
      return;
    }

    const productosExcel = filas.map(fila => ({
      nombre: fila.nombre || "",
      categoria: fila.categoria || "",
      precio: Number(fila.precio || 0),
      descripcion_corta: fila.descripcion_corta || "",
      descripcion_larga: fila.descripcion_larga || "",
      material: fila.material || "",
      color: fila.color || "",
      medidas: fila.medidas || "",
      disponibilidad: fila.disponibilidad || "",
      beneficios: fila.beneficios
        ? String(fila.beneficios).split("|").map(b => b.trim()).filter(b => b !== "")
        : [],
      imagen_principal: fila.imagen_principal || "",
      imagenes: fila.imagenes
        ? String(fila.imagenes).split(",").map(img => img.trim()).filter(img => img !== "")
        : [],
      activo: fila.activo === false || fila.activo === "false" || fila.activo === "NO"
        ? false
        : true
    }));

    const productosValidos = productosExcel.filter(p => 
      p.nombre && p.precio && p.imagen_principal
    );

    if (productosValidos.length === 0) {
      alert("No hay productos válidos. Revisa nombre, precio e imagen_principal.");
      return;
    }

    const confirmar = confirm(`Se cargarán ${productosValidos.length} productos. ¿Continuar?`);

    if (!confirmar) return;

    const { error } = await supabaseClient
      .from("productos")
      .insert(productosValidos);

    if (error) {
      console.error(error);
      alert("Error al cargar productos.");
      return;
    }

    alert("Productos cargados correctamente.");
    input.value = "";
    cargarProductosAdmin();
  };

  reader.readAsArrayBuffer(file);
}