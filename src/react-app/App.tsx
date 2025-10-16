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
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState("");

  // AI 스트림 요청 함수
  const fetchAiStream = async () => {
    setAiOutput(""); // 초기화
    const res = await fetch(`/api/ai?prompt=${encodeURIComponent(aiPrompt)}`);
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        const chunk = decoder.decode(value);
        // 여러 줄이 들어올 수 있으므로 줄 단위로 처리
        const lines = chunk.split("\n").filter(line => line.startsWith("data:"));
        for (const line of lines) {
          try {
            const json = JSON.parse(line.replace("data: ", ""));
            setAiOutput(prev => prev + (json.response ?? ""));
          } catch {
            // 무시
          }
        }
      }
      done = readerDone;
    }
  };

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

      <hr />
      <h2>Cloudflare AI (스트림)</h2>
      <input
        value={aiPrompt}
        onChange={e => setAiPrompt(e.target.value)}
        placeholder="AI에게 질문하세요"
        type="text"
        style={{ width: "60%" }}
      />
      <button onClick={fetchAiStream}>AI 질문</button>
      <pre style={{ textAlign: "left", minHeight: "80px" }}>{aiOutput}</pre>

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
