import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Mainmenu from "./Mainmenu.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Login.tsx";
import Signin from "./Signin.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Mainmenu />} />
        <Route path="/app" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signin />} />
      </Routes>
    </BrowserRouter>
    
  </StrictMode>,
);