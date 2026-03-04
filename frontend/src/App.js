import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Admin from "./pages/Admin";
import Student from "./pages/Student";
import "./index.css";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="home">
      <div className="home-card">
        <div className="chalk-lines" aria-hidden="true">
          <span /><span /><span />
        </div>
        <h1 className="home-title">
          <span className="title-math">∑</span> Column Math
        </h1>
        <p className="home-sub">Pick your role to get started</p>
        <div className="home-buttons">
          <button className="btn btn-admin" onClick={() => navigate("/admin")}>
            <span className="btn-icon">🖊️</span>
            Admin
            <span className="btn-desc">Create problems</span>
          </button>
          <button className="btn btn-student" onClick={() => navigate("/student")}>
            <span className="btn-icon">🎒</span>
            Student
            <span className="btn-desc">Solve problems</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/student" element={<Student />} />
      </Routes>
    </BrowserRouter>
  );
}