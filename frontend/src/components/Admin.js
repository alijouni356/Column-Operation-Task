import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Admin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    operand1: "",
    operand2: "",
    operation: "+",
    correct_answer: "",
    explanation: "",
  });
  const [status, setStatus] = useState(null); // "success" | "error"

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.operand1 || !form.operand2 || !form.correct_answer) {
      setStatus("error");
      return;
    }
    try {
      await axios.post("http://localhost:5000/problem", form);
      setStatus("success");
      setForm({ operand1: "", operand2: "", operation: "+", correct_answer: "", explanation: "" });
    } catch {
      setStatus("error");
    }
  };

  const preview = form.operand1
    ? `${form.operand1} ${form.operation} ${form.operand2}`
    : "? + ?";

  return (
    <div className="page admin-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
        <h2>Admin Panel</h2>
        <span className="header-badge">Create Problems</span>
      </header>

      <div className="admin-layout">
        {/* Form */}
        <div className="card form-card">
          <h3 className="card-title">New Problem</h3>

          <div className="field-row">
            <div className="field">
              <label>First Number</label>
              <input
                type="number"
                placeholder="e.g. 42"
                value={form.operand1}
                onChange={set("operand1")}
              />
            </div>
            <div className="field field-op">
              <label>Operation</label>
              <select value={form.operation} onChange={set("operation")}>
                <option value="+">＋</option>
                <option value="-">－</option>
                <option value="*">×</option>
                <option value="/">÷</option>
              </select>
            </div>
            <div className="field">
              <label>Second Number</label>
              <input
                type="number"
                placeholder="e.g. 18"
                value={form.operand2}
                onChange={set("operand2")}
              />
            </div>
          </div>

          <div className="field">
            <label>Correct Answer</label>
            <input
              type="number"
              placeholder="e.g. 60"
              value={form.correct_answer}
              onChange={set("correct_answer")}
            />
          </div>

          <div className="field">
            <label>Explanation <span className="optional">(optional)</span></label>
            <textarea
              placeholder="Explain how to solve this…"
              value={form.explanation}
              onChange={set("explanation")}
              rows={3}
            />
          </div>

          {status === "success" && (
            <div className="alert alert-success">✅ Problem created successfully!</div>
          )}
          {status === "error" && (
            <div className="alert alert-error">⚠️ Please fill in all required fields.</div>
          )}

          <button className="submit-btn" onClick={handleSubmit}>
            Save Problem →
          </button>
        </div>

        {/* Preview */}
        <div className="card preview-card">
          <h3 className="card-title">Preview</h3>
          <div className="column-preview">
            <div className="col-num">{form.operand1 || "?"}</div>
            <div className="col-op-row">
              <span className="col-op-symbol">{form.operation}</span>
              <span className="col-num">{form.operand2 || "?"}</span>
            </div>
            <div className="col-line" />
            <div className="col-answer">{form.correct_answer || "?"}</div>
          </div>
          {form.explanation && (
            <p className="preview-explanation">💡 {form.explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
}