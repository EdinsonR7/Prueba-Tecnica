import { Link } from "react-router-dom";
import axios from "axios";


 const insertarDatos = async () => {
    try {
      const nuevosDatos = {
        nombre: "Nuevo Nombre",
        mmspath: "/ruta/nueva",
      };
      const response = await axios.post("http://localhost:3001/insertar-datos", nuevosDatos);

      console.log(response.data.mensaje);
      // cargarDatos();
    } catch (error) {
      console.error("Error al insertar datos:", error);
    }
  };


export default function InsertarBaseDatos() {
  return (
    <div className="container">
      <form>
        <input type="text" placeholder="NOMBRE" />
        <input type="text" placeholder="MMSPATH" />
      </form>
      <button onClick={insertarDatos}>
        Insertar Datos en la Base de Datos
      </button>
      <Link to="/">Regresar</Link>
    </div>
  );
}
