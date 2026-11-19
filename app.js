// Arreglo donde viven las notas mientras la página está abierta.
// La fuente de la verdad es la base de datos (Supabase): cada cambio se guarda allá.
// Cada nota es: { id, titulo, contenido, orden }
//
// MODO LOCAL TEMPORAL: si supabase.js todavía tiene los valores de ejemplo
// (SUPABASE_CONFIGURADO es false), las notas se guardan solo en este navegador
// para que la página funcione sin errores. En cuanto se configure Supabase,
// el modo local se apaga solo y todo va a la base de datos.
let notas = [];

const form = document.getElementById("formNota");
const muro = document.getElementById("muro");
const mensaje = document.getElementById("mensaje");
const aviso = document.getElementById("aviso");

// Muestra un texto debajo del formulario
function avisar(texto) {
  mensaje.textContent = texto;
}

// Crea un botón con texto y una acción
function crearBoton(texto, accion) {
  const b = document.createElement("button");
  b.textContent = texto;
  b.addEventListener("click", accion);
  return b;
}

// ---------- MODO LOCAL TEMPORAL (se usa solo si Supabase no está configurado) ----------
const CLAVE_LOCAL = "monedero_prompts_notas";

function leerLocal() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_LOCAL)) || [];
  } catch {
    return [];
  }
}

function guardarLocal() {
  notas.forEach((nota, i) => { nota.orden = i; });
  localStorage.setItem(CLAVE_LOCAL, JSON.stringify(notas));
}

// ---------- BASE DE DATOS ----------

// Leer todas las notas, en el orden guardado
async function cargar() {
  if (!SUPABASE_CONFIGURADO) {
    aviso.textContent = "Modo local: las notas se guardan solo en este navegador (falta configurar Supabase).";
    notas = leerLocal();
    pintar();
    return;
  }

  const { data, error } = await clienteSupabase
    .from(TABLA)
    .select("id, titulo, contenido, orden")
    .order("orden", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    avisar("No se pudieron cargar las notas: " + error.message);
    return;
  }
  notas = data;
  pintar();
}

// Guardar una nota nueva
async function crearNota(titulo, contenido) {
  if (!SUPABASE_CONFIGURADO) {
    notas.push({ id: Date.now(), titulo, contenido, orden: notas.length });
    guardarLocal();
    return true;
  }

  const { data, error } = await clienteSupabase
    .from(TABLA)
    .insert({ titulo, contenido, orden: notas.length })
    .select("id, titulo, contenido, orden")
    .single();

  if (error) {
    avisar("No se pudo guardar: " + error.message);
    return false;
  }
  notas.push(data);
  return true;
}

// Borrar una nota
async function borrarNota(indice) {
  if (!SUPABASE_CONFIGURADO) {
    notas.splice(indice, 1);
    guardarLocal();
    pintar();
    return;
  }

  const { error } = await clienteSupabase
    .from(TABLA)
    .delete()
    .eq("id", notas[indice].id);

  if (error) {
    avisar("No se pudo borrar: " + error.message);
    return;
  }
  notas.splice(indice, 1);
  pintar();
}

// Guardar el orden actual: cada nota recibe como "orden" su posición en el arreglo
async function guardarOrden() {
  if (!SUPABASE_CONFIGURADO) {
    guardarLocal();
    return;
  }

  notas.forEach((nota, i) => { nota.orden = i; });

  const { error } = await clienteSupabase
    .from(TABLA)
    .upsert(notas, { onConflict: "id" });

  if (error) avisar("No se pudo guardar el orden: " + error.message);
}

// ---------- PANTALLA ----------

// Mueve una nota una posición (-1 = arriba, 1 = abajo)
async function mover(indice, direccion) {
  const destino = indice + direccion;
  if (destino < 0 || destino >= notas.length) return;
  [notas[indice], notas[destino]] = [notas[destino], notas[indice]];
  pintar();
  await guardarOrden();
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
      crearBoton("  Borrar", () => borrarNota(i))
    );

    tarjeta.append(h3, p, barra);
    muro.appendChild(tarjeta);
  });
}

// Publicar: toma título y contenido de sus campos y los guarda en la base de datos
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const contenido = document.getElementById("contenido").value.trim();
  if (!titulo) return;

  avisar("Guardando...");
  const guardada = await crearNota(titulo, contenido);
  if (!guardada) return;

  avisar("");
  form.reset();
  pintar();
});

// Orden alfanumérico: "Nota 2" va antes que "Nota 10"
async function ordenar(sentido) {
  notas.sort((a, b) =>
    sentido * a.titulo.localeCompare(b.titulo, "es", { numeric: true, sensitivity: "base" })
  );
  pintar();
  await guardarOrden();
}
document.getElementById("btnAsc").addEventListener("click", () => ordenar(1));
document.getElementById("btnDesc").addEventListener("click", () => ordenar(-1));

// Al abrir la página, traemos las notas guardadas
cargar();
