import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function calcAnswer(operand1, operand2, operation) {
  const a = parseFloat(operand1);
  const b = parseFloat(operand2);
  if (isNaN(a) || isNaN(b)) return "";
  if (operation === "/" && b === 0) return "";
  const result = operation === "+" ? a + b
               : operation === "-" ? a - b
               : operation === "*" ? a * b
               : parseFloat((a / b).toFixed(4));
  return String(result);
}

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

  const set = (k) => (e) => {
    const updated = { ...form, [k]: e.target.value };
    // Auto-calculate answer whenever operands or operation change
    if (k === "operand1" || k === "operand2" || k === "operation") {
      updated.correct_answer = calcAnswer(
        k === "operand1" ? e.target.value : updated.operand1,
        k === "operand2" ? e.target.value : updated.operand2,
        k === "operation" ? e.target.value : updated.operation
      );
    }
    setForm(updated);
  };

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
            <label>
              Correct Answer
              {form.correct_answer && form.operand1 && form.operand2 && (
                <span className="auto-badge">⚡ auto-filled</span>
              )}
            </label>
            <input
              type="number"
              placeholder="Fills automatically…"
              value={form.correct_answer}
              onChange={set("correct_answer")}
              className={form.correct_answer && form.operand1 && form.operand2 ? "input-autofilled" : ""}
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