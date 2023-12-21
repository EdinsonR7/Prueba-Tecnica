import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import InsertarBaseDatos from "./components/InsertarBaseDatos";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/insertardatos" element={<InsertarBaseDatos />} />
      </Routes>
    </div>
  );
}

export default App;
