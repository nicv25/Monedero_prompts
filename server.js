const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());             // permite leer JSON del body
app.use(express.static("public"));   // sirve index.html, style.css y app.js

// Conexión a MySQL (XAMPP: root sin contraseña)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "cajas_db"
});


// Leer las notas guardadas
app.get("/api/cajas", async (req, res) => {
  try {
    const [filas] = await pool.query("SELECT titulo, contenido FROM cajas ORDER BY id");
    res.json(filas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al leer: " + error.message });
  }
});

// Guardar las notas: reemplaza lo anterior por lo que hay en pantalla
app.post("/api/cajas", async (req, res) => {
  const notas = req.body;
  let conexion;

  try {
    conexion = await pool.getConnection();
    await conexion.beginTransaction();
    await conexion.query("DELETE FROM cajas");

    if (notas.length > 0) {
      const valores = notas.map(n => [n.titulo, n.contenido]);
      await conexion.query("INSERT INTO cajas (titulo, contenido) VALUES ?", [valores]);
    }

    await conexion.commit();
    res.json({ mensaje: ` ${notas.length} notas guardadas` });
  } catch (error) {
    if (conexion) await conexion.rollback();
    res.status(500).json({ mensaje: " Error: " + error.message });
  } finally {
    if (conexion) conexion.release();
  }
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));