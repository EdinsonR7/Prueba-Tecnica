import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

export default function InsertarBaseDatos({ cargarDatos }) {
  console.log(cargarDatos);
  const [nombre, setNombre] = useState("");
  const [mmspath, setMmspath] = useState("");

  const insertarDatos = async () => {
    try {
      const nuevosDatos = {
        nombre: nombre,
        mmspath: mmspath,
      };

      const response = await axios.post(
        "http://localhost:3001/insertar-datos",
        nuevosDatos
      );

      console.log(response.data.mensaje);
      cargarDatos();
    } catch (error) {
      console.error("Error al insertar datos:", error);
    }
  };

  return (
    <div className="container">
      <form>
        <input
          type="text"
          placeholder="NOMBRE"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="MMSPATH"
          value={mmspath}
          onChange={(e) => setMmspath(e.target.value)}
        />
      </form>
      <button onClick={insertarDatos}>
        Insertar Datos en la Base de Datos
      </button>
      <Link to="/">Regresar</Link>
    </div>
  );
}
InsertarBaseDatos.propTypes = {
  cargarDatos: PropTypes.func.isRequired,
};
