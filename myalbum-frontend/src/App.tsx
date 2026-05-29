import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TemaProvider } from "./contexts/TemaContext";
import RotaProtegida from "./components/RotaProtegida";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Trocas from "./pages/Trocas";
import Historico from "./pages/Historico";
import "./index.css";
import { Album } from "./pages/Album";

function App() {
  return (
    <TemaProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route
              path="/album"
              element={
                <RotaProtegida>
                  <Album />
                </RotaProtegida>
              }
            />
            <Route
              path="/trocas"
              element={
                <RotaProtegida>
                  <Trocas />
                </RotaProtegida>
              }
            />
            <Route
              path="/historico"
              element={
                <RotaProtegida>
                  <Historico />
                </RotaProtegida>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TemaProvider>
  );
}

export default App;
