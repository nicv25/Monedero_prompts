// Arreglo donde viven las notas mientras trabajás
let notas = [];

const form = document.getElementById("formNota");
const muro = document.getElementById("muro");
const mensaje = document.getElementById("mensaje");

// Crea un botón con texto y una acción
function crearBoton(texto, accion) {
  const b = document.createElement("button");
  b.textContent = texto;
  b.addEventListener("click", accion);
  return b;
}

// Mueve una nota una posición (-1 = arriba, 1 = abajo)
function mover(indice, direccion) {
  const destino = indice + direccion;
  if (destino < 0 || destino >= notas.length) return;
  [notas[indice], notas[destino]] = [notas[destino], notas[indice]];
  pintar();
}

// Dibuja todas las notas en pantalla
function pintar() {
  muro.innerHTML = "";

  notas.forEach((nota, i) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "nota";

    const h3 = document.createElement("h3");
    h3.textContent = nota.titulo;

    const p = document.createElement("p");
    p.textContent = nota.contenido;

    const barra = document.createElement("div");
    barra.className = "barra";
    barra.append(
      crearBoton("↑", () => mover(i, -1)),
      crearBoton("↓", () => mover(i, 1)),
      crearBoton("  Borrar", () => { notas.splice(i, 1); pintar(); })
    );

    tarjeta.append(h3, p, barra);
    muro.appendChild(tarjeta);
  });
}

// Publicar: toma título y contenido de sus campos
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const contenido = document.getElementById("contenido").value.trim();
  if (!titulo) return;

  notas.push({ titulo, contenido });

  form.reset();
  pintar();
});

// Orden alfanumérico: "Nota 2" va antes que "Nota 10"
function ordenar(sentido) {
  notas.sort((a, b) =>
    sentido * a.titulo.localeCompare(b.titulo, "es", { numeric: true, sensitivity: "base" })
  );
  pintar();
}
document.getElementById("btnAsc").addEventListener("click", () => ordenar(1));
document.getElementById("btnDesc").addEventListener("click", () => ordenar(-1));

// Respaldo en el navegador (localStorage) para cuando no hay servidor,
// por ejemplo cuando la página se abre desde GitHub Pages
const CLAVE_LOCAL = "guardador_info_notas";

function guardarLocal() {
  localStorage.setItem(CLAVE_LOCAL, JSON.stringify(notas));
}

function cargarLocal() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_LOCAL)) || [];
  } catch {
    return [];
  }
}

// Guardar en MySQL a través del servidor; si no hay servidor, en el navegador
document.getElementById("btnGuardar").addEventListener("click", async () => {
  try {
    const res = await fetch("/api/cajas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notas)
    });
    if (!res.ok) throw new Error("servidor no disponible");
    const data = await res.json();
    mensaje.textContent = data.mensaje;
  } catch (err) {
    guardarLocal();
    mensaje.textContent = ` ${notas.length} notas guardadas en este navegador`;
  }
});

// Cargar lo guardado al abrir la página (MySQL o, si no hay servidor, el navegador)
async function cargar() {
  try {
    const res = await fetch("/api/cajas");
    if (!res.ok) throw new Error("servidor no disponible");
    notas = await res.json();
  } catch {
    notas = cargarLocal();
  }
  pintar();
}
cargar();