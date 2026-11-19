// =========================================================
// CONEXIÓN CON SUPABASE
// Este es el ÚNICO archivo que conoce la base de datos.
// El resto de la página (app.js) solo usa "clienteSupabase".
//
// Dónde sacar los dos valores (en tu proyecto de Supabase):
//   Project Settings → API
//     - Project URL  → SUPABASE_URL
//     - anon public  → SUPABASE_ANON_KEY   (es pública, puede ir en el código)
//
// NUNCA pegues aquí la llave "service_role": esa sí es secreta.
// =========================================================

const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU-LLAVE-ANON-PUBLICA";

// ¿Ya pegaste tus valores reales? Mientras sigan los textos de ejemplo,
// la página NO intenta conectarse (así no da errores) y usa el modo local de app.js.
const SUPABASE_CONFIGURADO =
  !SUPABASE_URL.includes("TU-PROYECTO") && !SUPABASE_ANON_KEY.includes("TU-LLAVE");

// "supabase" lo carga el <script> de index.html antes que este archivo
const clienteSupabase = SUPABASE_CONFIGURADO
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Tabla donde viven los prompts (ver README.md para crearla)
const TABLA = "prompts";
