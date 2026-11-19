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

// "supabase" lo carga el <script> de index.html antes que este archivo
const clienteSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tabla donde viven los prompts (ver README.md para crearla)
const TABLA = "prompts";
