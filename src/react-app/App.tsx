// src/App.tsx

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import cloudflareLogo from "./assets/Cloudflare_Logo.svg";
import honoLogo from "./assets/hono.svg";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [cmd, setCmd] = useState("/api/");

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://hono.dev/" target="_blank">
          <img src={honoLogo} className="logo cloudflare" alt="Hono logo" />
        </a>
        <a href="https://workers.cloudflare.com/" target="_blank">
          <img
            src={cloudflareLogo}
            className="logo cloudflare"
            alt="Cloudflare logo"
          />
        </a>
      </div>
      <h1>Vite + React + Hono + Cloudflare</h1>
      <input 
        value={cmd}
        onChange={(e) => setCmd(e.target.value)}
        placeholder="url"
        type="text"
      />
      <button onClick={async () => {
        const res = await fetch(cmd);
        const data = await res.json();
        setName(JSON.stringify(data, null, 2));
      }}>Fetch</button>
      <pre style={{ textAlign: "left" }}>{name}</pre>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <p>
        Click on the Vite, React, Hono, and Cloudflare logos to learn more
      </p>
    </>
  );
}

export default App;
