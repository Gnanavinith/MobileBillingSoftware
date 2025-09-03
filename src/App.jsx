import React from "react";

export default function App() {
  return (
    <div className="card">
      <h1>Hello from Electron + Vite + React ⚡</h1>
      <p>
        This UI runs inside the Windows desktop app, and also on localhost
        during development.
      </p>
      <p>dfaf</p>
      <small>Platform: {window.appInfo?.platform ?? "unknown"}</small>

      <div className="btns">
        <button onClick={() => window.open("https://vitejs.dev")}>
          Open Vite Docs
        </button>
        <button onClick={() => window.open("https://www.electronjs.org")}>
          Open Electron
        </button>
      </div>
    </div>
  );
}