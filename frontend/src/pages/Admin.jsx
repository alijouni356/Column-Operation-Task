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

// For "lq": compute the best (a×b)/c from 3 digits
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((v, i) =>
    permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [v, ...p])
  );
}
function bestLQ(digits) {
  let best = null, bestVal = -Infinity;
  for (const [a, b, c] of permutations(digits)) {
    if (c === 0) continue;
    const val = (a * b) / c;
    if (val > bestVal) { bestVal = val; best = { a, b, c, val }; }
  }
  return best;
}

export default function Admin() {
  const navigate = useNavigate();
  const [operation, setOperation] = useState("+");

  // Standard form state
  const [form, setForm] = useState({
    operand1: "", operand2: "", correct_answer: "", explanation: "",
  });

  // Largest Quotient form state — 3 digit inputs
  const [lqDigits, setLqDigits] = useState(["", "", ""]);
  const [lqExplanation, setLqExplanation] = useState("");

  const [status, setStatus] = useState(null);

  // ── Standard field handler ──
  const set = (k) => (e) => {
    const updated = { ...form, [k]: e.target.value };
    if (k === "operand1" || k === "operand2") {
      updated.correct_answer = calcAnswer(
        k === "operand1" ? e.target.value : updated.operand1,
        k === "operand2" ? e.target.value : updated.operand2,
        operation
      );
    }
    setForm(updated);
  };

  const handleOperationChange = (e) => {
    const op = e.target.value;
    setOperation(op);
    if (op !== "lq") {
      setForm(f => ({
        ...f,
        correct_answer: calcAnswer(f.operand1, f.operand2, op),
      }));
    }
  };

  // ── LQ digit handler ──
  const setLqDigit = (i, val) => {
    setLqDigits(d => d.map((v, j) => j === i ? val : v));
  };

  const lqBest = lqDigits.every(d => d !== "") 
    ? bestLQ(lqDigits.map(Number)) 
    : null;

  // ── Submit ──
  const handleSubmit = async () => {
    try {
      if (operation === "lq") {
        if (lqDigits.some(d => d === "")) { setStatus("error"); return; }
        // Save to dedicated lq_problems table with individual digit columns
        await axios.post("http://localhost:5000/lq-problem", {
          digit1: Number(lqDigits[0]),
          digit2: Number(lqDigits[1]),
          digit3: Number(lqDigits[2]),
          best_quotient: lqBest.val.toFixed(4),
          explanation: lqExplanation,
        });
        setLqDigits(["", "", ""]);
        setLqExplanation("");
      } else {
        if (!form.operand1 || !form.operand2 || !form.correct_answer) {
          setStatus("error"); return;
        }
        await axios.post("http://localhost:5000/problem", {
          ...form, operation,
        });
        setForm({ operand1: "", operand2: "", correct_answer: "", explanation: "" });
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const isLQ = operation === "lq";

  return (
    <div className="page admin-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
        <h2>Admin Panel</h2>
        <span className="header-badge">Create Problems</span>
      </header>

      <div className="admin-layout">
        <div className="card form-card">
          <h3 className="card-title">New Problem</h3>

          {/* Operation selector — always visible first */}
          <div className="field">
            <label>Operation Type</label>
            <select value={operation} onChange={handleOperationChange} className="op-select-full">
              <option value="+">＋ Addition</option>
              <option value="-">－ Subtraction</option>
              <option value="*">× Multiplication</option>
              <option value="/">÷ Division (Partial Quotients)</option>
              <option value="lq">🏆 Largest Quotient</option>
            </select>
          </div>

          {/* ── STANDARD FORM ── */}
          {!isLQ && (
            <>
              <div className="field-row">
                <div className="field">
                  <label>First Number</label>
                  <input type="number" placeholder="e.g. 42" value={form.operand1} onChange={set("operand1")} />
                </div>
                <div className="field-op-spacer">
                  <span className="op-badge">
                    {operation === "+" ? "＋" : operation === "-" ? "－" : operation === "*" ? "×" : "÷"}
                  </span>
                </div>
                <div className="field">
                  <label>Second Number</label>
                  <input type="number" placeholder="e.g. 18" value={form.operand2} onChange={set("operand2")} />
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
                <textarea placeholder="Explain how to solve this…" value={form.explanation}
                  onChange={set("explanation")} rows={3} />
              </div>
            </>
          )}

          {/* ── LARGEST QUOTIENT FORM ── */}
          {isLQ && (
            <>
              <div className="lq-admin-info">
                <span>🏆</span>
                <p>Enter 3 digits. The student will drag them into <strong>□ × □ ÷ □</strong> to make the largest quotient.</p>
              </div>

              <div className="field">
                <label>The 3 Digits</label>
                <div className="lq-digit-inputs">
                  {lqDigits.map((d, i) => (
                    <input
                      key={i}
                      type="number"
                      min="1" max="9"
                      placeholder={`#${i + 1}`}
                      value={d}
                      onChange={e => setLqDigit(i, e.target.value)}
                      className="lq-digit-input"
                    />
                  ))}
                </div>
              </div>

              {lqBest && (
                <div className="lq-admin-preview">
                  <span className="lq-preview-label">Best arrangement:</span>
                  <span className="lq-preview-eq">
                    {lqBest.a} × {lqBest.b} ÷ {lqBest.c} = <strong>{lqBest.val.toFixed(2)}</strong>
                  </span>
                </div>
              )}

              <div className="field">
                <label>Explanation <span className="optional">(optional)</span></label>
                <textarea placeholder="e.g. Put the largest numbers on top to maximize the quotient…"
                  value={lqExplanation} onChange={e => setLqExplanation(e.target.value)} rows={3} />
              </div>
            </>
          )}

          {status === "success" && <div className="alert alert-success">✅ Problem created successfully!</div>}
          {status === "error"   && <div className="alert alert-error">⚠️ Please fill in all required fields.</div>}

          <button className="submit-btn" onClick={handleSubmit}>Save Problem →</button>
        </div>

        {/* Preview card */}
        <div className="card preview-card">
          <h3 className="card-title">Preview</h3>

          {!isLQ ? (
            <>
              <div className="column-preview">
                <div className="col-num">{form.operand1 || "?"}</div>
                <div className="col-op-row">
                  <span className="col-op-symbol">
                    {operation === "+" ? "＋" : operation === "-" ? "－" : operation === "*" ? "×" : "÷"}
                  </span>
                  <span className="col-num">{form.operand2 || "?"}</span>
                </div>
                <div className="col-line" />
                <div className="col-answer">{form.correct_answer || "?"}</div>
              </div>
              {form.explanation && <p className="preview-explanation">💡 {form.explanation}</p>}
            </>
          ) : (
            <div className="lq-preview-card">
              <div className="lq-chip-preview">
                {lqDigits.map((d, i) => (
                  <span key={i} className={`lq-chip ${d ? "" : "lq-chip-empty"}`}>{d || "?"}</span>
                ))}
              </div>
              <div className="lq-eq-preview">
                <div className="lq-top-row">
                  <div className="lq-box-preview">?</div>
                  <span className="lq-op">×</span>
                  <div className="lq-box-preview">?</div>
                </div>
                <div className="lq-divide-line" />
                <div className="lq-bottom-row">
                  <div className="lq-box-preview">?</div>
                </div>
              </div>
              {lqBest && (
                <p className="preview-explanation">
                  ✅ Best: {lqBest.a} × {lqBest.b} ÷ {lqBest.c} = <strong>{lqBest.val.toFixed(2)}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}