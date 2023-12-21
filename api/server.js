const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const app = express();

const datos = [];

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "busqueda",
  password: "12345",
  port: 5432,
});

// Función para medir la capacidad de una expresión
const medirCapacidadExpresion = (expresion) => {
  // Verifica si la expresión está definida antes de intentar acceder a su longitud
  if (expresion) {
    return expresion.length;
  } else {
    // Devuelve 0 o algún valor predeterminado si la expresión no está definida
    return 0;
  }
};

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(bodyParser.json());

// Cargar datos desde el archivo CSV y guardarlos en la base de datos PostgreSQL
fs.createReadStream("datos.csv")
  .pipe(csv())
  .on("data", async (row) => {
    datos.push(row);

    // Guardar cada fila en la base de datos
    try {
      await pool.query(
        "INSERT INTO visualizacion (nombre, mmspath) VALUES ($1, $2)",
        [row.NOMBRE, row.MMSPATH]
      );
    } catch (error) {
      console.error("Error al insertar en PostgreSQL:", error);
    }
  })
  .on("end", () => {
    console.log(
      "Datos cargados desde el archivo CSV y almacenados en PostgreSQL:",
      datos
    );
  });

app.get("/cargar-datos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM visualizacion");
    const datosDesdePostgreSQL = result.rows;
    res.json(datosDesdePostgreSQL);
  } catch (error) {
    console.error("Error al cargar datos desde PostgreSQL:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/cargar-datos", async (req, res) => {
  try {
    console.log("Ruta completa del archivo:", path.resolve("datos.csv"));
    const stream = fs.createReadStream("datos.csv").pipe(csv());

    stream.on("data", async (row) => {
      // Guardar cada fila en la base de datos
      await pool.query(
        "INSERT INTO visualizacion(nombre, mmspath) VALUES($1, $2)",
        [row.nombre, row.mmspath]
      );
    });

    stream.on("end", () => {
      console.log("Datos cargados en la base de datos.");
      res.status(200).send("Datos cargados en la base de datos.");
    });
  } catch (error) {
    console.error("Error al cargar datos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

app.post("/insertar-datos", async (req, res) => {
  const { nombre, mmspath } = req.body;

  try {
    // Realizar la inserción de datos en la base de datos
    await pool.query(
      "INSERT INTO visualizacion (nombre, mmspath) VALUES ($1, $2)",
      [nombre, mmspath]
    );

    res.status(200).json({ mensaje: "Datos insertados correctamente" });
  } catch (error) {
    console.error("Error al insertar datos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ...

// Función para obtener expresiones desde la base de datos
const obtenerExpresionesDesdeBaseDeDatos = async () => {
  try {
    const result = await pool.query("SELECT expresion FROM expresiones");
    const expresionesDesdeBaseDeDatos = result.rows.map((row) => row.expresion);

    return expresionesDesdeBaseDeDatos;
  } catch (error) {
    console.error(
      "Error al obtener expresiones desde la base de datos:",
      error
    );
    throw error;
  }
};

// Función para eliminar prefijos comunes
const eliminarPrefijosComunes = (expresiones) => {
  if (!expresiones || expresiones.length === 0) {
    return expresiones;
  }

  // Encuentra el prefijo común más largo
  const prefijoComun = expresiones.reduce((prefijo, expresion) => {
    let longitudComun = 0;
    while (expresion.startsWith(prefijo) && longitudComun <= prefijo.length) {
      longitudComun++;
      prefijo = expresion.slice(0, longitudComun);
    }
    return prefijo;
  }, expresiones[0]);

  // Elimina el prefijo común de todas las expresiones
  const expresionesOptimizadas = expresiones.map((expresion) =>
    expresion.slice(prefijoComun.length)
  );

  return expresionesOptimizadas;
};

app.post("/buscar", async (req, res) => {
  const { expresion } = req.body;

  // Verifica si la solicitud incluye una expresión optimizada
  if (req.body.expresionOptimizada) {
    // Utiliza la expresión optimizada
    req.body.expresion = req.body.expresionOptimizada;
  }

  // Medir la capacidad de la expresión en el backend
  const capacidad = medirCapacidadExpresion(req.body.expresion);
  console.log("Capacidad de la expresión:", capacidad);

  try {
    // Verifica si la solicitud incluye expresiones desde la base de datos
    if (req.body.incluirExpresionesBD) {
      // Obtén las expresiones desde la base de datos
      const expresionesEnBaseDeDatos =
        await obtenerExpresionesDesdeBaseDeDatos();

      // Agrega la expresión de búsqueda a las expresiones existentes
      const expresionesTotales = [
        ...expresionesEnBaseDeDatos,
        req.body.expresion,
      ];

      // Optimiza las expresiones
      req.body.expresion = eliminarPrefijosComunes(expresionesTotales);
    }

    const result = await pool.query(
      "SELECT * FROM visualizacion WHERE mmspath ~* $1",
      [`.*${req.body.expresion}.*`]
    );
    const resultadoDesdePostgreSQL = result.rows;

    // Incluir la capacidad en la respuesta
    res.json({ capacidad, resultados: resultadoDesdePostgreSQL });
  } catch (error) {
    console.error("Error al buscar en PostgreSQL:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//

const puerto = 3001;
app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
