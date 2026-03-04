// src/App.js
import React, { useState } from "react";
import Admin from "./components/Admin";
import Student from "./components/Student";

function App() {
  const [mode, setMode] = useState("");

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Math Column System</h1>

      {!mode && (
        <>
          <button onClick={() => setMode("admin")}>Admin</button>
          <button onClick={() => setMode("student")}>Student</button>
        </>
      )}

      {mode === "admin" && <Admin />}
      {mode === "student" && <Student />}
    </div>
  );
}

export default App;