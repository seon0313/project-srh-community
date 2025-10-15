import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Mainmenu from "./Mainmenu.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Login.tsx";
import Signin from "./Signin.tsx";
import Welcome from "./Welcome.tsx";
import User from "./User.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Mainmenu />} />
        <Route path="/app" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signin />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/user/:id" element={<User />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </BrowserRouter>
    
  </StrictMode>,
);