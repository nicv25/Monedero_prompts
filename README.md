# Monedero de prompts

Muro de notas para guardar prompts. Los datos viven en una base de datos de **Supabase** (PostgreSQL en la nube);
la página es estática y se publica en GitHub Pages.

## Estructura

```
index.html   → la página
style.css    → estilos
app.js       → lógica de la página (publicar, ordenar, mover, borrar)
supabase.js  → único archivo con la conexión a la base de datos
```

## Configuración de Supabase

1. Crear un proyecto en <https://supabase.com>.
2. En **SQL Editor** ejecutar:

```sql
create table public.prompts (
  id         bigint generated always as identity primary key,
  titulo     text not null check (char_length(titulo) between 1 and 100),
  contenido  text not null default '' check (char_length(contenido) <= 5000),
  orden      integer not null default 0,
  creado_en  timestamptz not null default now()
);

alter table public.prompts enable row level security;

-- Ejercicio sin inicio de sesión: cualquiera con la llave pública puede leer y escribir.
create policy "leer prompts"    on public.prompts for select to anon using (true);
create policy "crear prompts"   on public.prompts for insert to anon with check (true);
create policy "editar prompts"  on public.prompts for update to anon using (true) with check (true);
create policy "borrar prompts"  on public.prompts for delete to anon using (true);
```

3. En **Project Settings → API** copiar `Project URL` y la llave `anon public`
   y pegarlas en `supabase.js` (`SUPABASE_URL` y `SUPABASE_ANON_KEY`).
   La llave `anon` es pública por diseño; la `service_role` **nunca** va en el código.

## Modo local temporal

Mientras `supabase.js` conserve los textos de ejemplo (`TU-PROYECTO` y `TU-LLAVE-ANON-PUBLICA`), la página
no se conecta a ninguna base de datos y guarda las notas solo en el navegador. Así se puede publicar en GitHub Pages
sin errores aunque Supabase todavía no esté configurado. Se ve un aviso amarillo que lo indica.
En cuanto se pegan los valores reales, el modo local se apaga solo y todo se guarda en Supabase.

## Publicación

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / `(root)`**.

## Probar en local

Abrir `index.html` con una extensión como Live Server, o con `python3 -m http.server`.
