
import { useState, useEffect } from "react";
import axios from "axios";
import TreeComponent from "./TreeComponent";
import { Link } from "react-router-dom";



const Home = () => {
  const [datos, setDatos] = useState([]);
  const [expresionBusqueda, setExpresionBusqueda] = useState("");
  const [resultadoBusqueda, setResultadoBusqueda] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [coincidencias, setCoincidencias] = useState(0);


  // Lógica para cargar datos al montar el componente y al recargar la página
  useEffect(() => {
    cargarDatos();
  }, []); 

 
  const cargarDatos = async () => {
    try {
      const response = await axios.get("http://localhost:3001/cargar-datos");
      setDatos(response.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const buscarExpresionRegular = async () => {
    setCargando(true);
    try {
      const regexString = expresionBusqueda.replace(/\\/g, "\\\\");
      const regex = new RegExp(regexString, "i");

      const response = await axios.post("http://localhost:3001/buscar", {
        expresion: regex.source,
      });
      
      setResultadoBusqueda(response.data.resultados);
      setCoincidencias(response.data.capacidad);
      console.log(response.data.capacidad);
    } catch (error) {
      console.error("Error al buscar expresión regular:", error);
      setResultadoBusqueda([]);
    } finally {
      setCargando(false);
    }
  };


  return (
    <div>
      <h1>Aplicación de Visualización y Búsqueda</h1>
      <div className="buscador">
        <input
          type="text"
          value={expresionBusqueda}
          onChange={(e) => setExpresionBusqueda(e.target.value)}
          placeholder="Expresión Regular de Búsqueda"
        />
        <button onClick={buscarExpresionRegular}>Buscar</button>
      </div>
      <div className="container">
        <Link to='/insertardatos'>
         Insertar Datos en la Base de Datos
        </Link>
        <button onClick={cargarDatos}>Recargar Datos</button>
      </div>
      <div className="resultado">
      {cargando && <p>Cargando resultados...</p>}
      {resultadoBusqueda.length > 0 ? (
        <div>
          <h2>Resultado de Búsqueda:</h2>
          <TreeComponent data={resultadoBusqueda} />
        </div>
      ) : (
        <p>No se encontraron resultados.</p>
        )}
      <div>
        <h2>Datos Cargados:</h2>
        <pre>{JSON.stringify(datos, null, 1)}</pre>
        {console.log(datos)}
      </div>
        <div>
        <h2>Número de coincidencias:</h2>
        {coincidencias}
        </div>
      </div>
    </div>
  );
};

export default Home;

