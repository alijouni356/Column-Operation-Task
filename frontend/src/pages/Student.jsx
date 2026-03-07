import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PartialQuotient from "./PartialQuotient";
import LargestQuotient from "./LargestQuotient";

export default function Student() {
  const navigate = useNavigate();
  const [problem, setProblem]       = useState(null);
  const [answer, setAnswer]         = useState("");
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake]           = useState(false);
  const [done, setDone]             = useState(false);

  const loadProblem = () => {
    setLoading(true);
    setResult(null);
    setAnswer("");
    setDone(false);
    setProblem(null);
    axios.get("http://localhost:5000/random-problem")
      .then(res => {
        if (res.data.message) { setLoading(false); return; }
        // /random-problem adds source="lq" for lq_problems, source="standard" for problems
        const operation = res.data.source === "lq"
          ? "lq"
          : String(res.data.operation).trim();
        setProblem({ ...res.data, operation });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadProblem(); }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  // +  −  ×  handlers
  const handleSubmit = async () => {
    if (!answer) return;
    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5000/submit-answer", {
        problem_id: problem.id,
        student_answer: answer,
      });
      setResult(res.data);
      if (res.data.result === "Wrong") triggerShake();
    } finally { setSubmitting(false); }
  };

  // Division (partial quotient)
  const handleDivisionSubmit = async (isCorrect, quotient) => {
    const res = await axios.post("http://localhost:5000/submit-answer", {
      problem_id: problem.id,
      student_answer: quotient,
    });
    setResult(res.data);
    setDone(true);
    if (!isCorrect) triggerShake();
  };

  // Largest quotient — called by LargestQuotient component on submit
  const handleLQSubmit = async (isCorrect) => {
    const res = await axios.post("http://localhost:5000/lq-submit", {
      lq_problem_id: problem.id,
      is_correct: isCorrect,
    });
    setResult({ ...res.data, done: true });
    setDone(true);
    if (!isCorrect) triggerShake();
  };

  const opSymbol = { "+": "＋", "-": "－", "*": "×", "/": "÷" };
  const op         = problem ? String(problem.operation).trim() : "";
  const isDivision = op === "/";
  const isLQ       = op === "lq";

  return (
    <div className="page student-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
        <h2>Solve It!</h2>
        <button className="next-btn" onClick={loadProblem}>Next →</button>
      </header>

      <div className="student-center">

        {/* Loading */}
        {loading && (
          <div className="card solve-card loading-card">
            <div className="loader" /><p>Loading problem…</p>
          </div>
        )}

        {/* No problems */}
        {!loading && !problem && (
          <div className="card solve-card empty-card">
            <span className="empty-icon">📭</span>
            <p>No problems yet. Ask your admin to add some!</p>
          </div>
        )}

        {/* ══════════════════════════════════════
            LARGEST QUOTIENT — dedicated view
        ══════════════════════════════════════ */}
        {!loading && problem && isLQ && (
          <div className={`card solve-card solve-card-wide ${shake ? "shake" : ""}`}>
            <div className="lq-header">
              <span className="problem-label">Problem #{problem.id}</span>
              <span className="lq-type-badge">🏆 Largest Quotient</span>
            </div>

            <LargestQuotient
              digits={[Number(problem.digit1), Number(problem.digit2), Number(problem.digit3)]}
              onSubmit={handleLQSubmit}
            />

            {/* Next button appears after submit */}
            {done && (
              <div className="lq-done-row">
                {problem.explanation && (
                  <p className="explanation">💡 {problem.explanation}</p>
                )}
                <button className="submit-btn" onClick={loadProblem}>
                  Next Problem →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            DIVISION — partial quotient view
        ══════════════════════════════════════ */}
        {!loading && problem && isDivision && (
          <div className={`card solve-card solve-card-wide ${shake ? "shake" : ""}`}>
            <p className="problem-label">Problem #{problem.id}</p>

            <PartialQuotient
              dividend={Number(problem.operand1)}
              divisor={Number(problem.operand2)}
              onSubmit={handleDivisionSubmit}
            />

            {done && (
              <div className="lq-done-row">
                {problem.explanation && (
                  <p className="explanation">💡 {problem.explanation}</p>
                )}
                <button className="submit-btn" onClick={loadProblem}>
                  Next Problem →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            STANDARD  +  −  ×  — column view
        ══════════════════════════════════════ */}
        {!loading && problem && !isDivision && !isLQ && (
          <div className={`card solve-card ${shake ? "shake" : ""}`}>
            <p className="problem-label">Problem #{problem.id}</p>

            <div className="column-display">
              <div className="col-num">{problem.operand1}</div>
              <div className="col-op-row">
                <span className="col-op-symbol">{opSymbol[op] || op}</span>
                <span className="col-num">{problem.operand2}</span>
              </div>
              <div className="col-line" />
              <div className="col-num col-blank">?</div>
            </div>

            {!result && (
              <div className="answer-section">
                <input
                  type="number"
                  className="answer-input"
                  placeholder="Your answer"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  autoFocus
                />
                <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Checking…" : "Submit →"}
                </button>
              </div>
            )}

            {result && (
              <div className={`result-panel ${result.result === "Correct" ? "correct" : "wrong"}`}>
                {result.result === "Correct" ? (
                  <>
                    <span className="result-icon">🎉</span>
                    <h3>Correct!</h3>
                    <button className="submit-btn mt" onClick={loadProblem}>Next Problem →</button>
                  </>
                ) : (
                  <>
                    <span className="result-icon">❌</span>
                    <h3>Wrong</h3>
                    <p>Correct answer: <strong>{result.correct_answer}</strong></p>
                    {result.explanation && <p className="explanation">💡 {result.explanation}</p>}
                    <button className="submit-btn mt" onClick={loadProblem}>Try Another →</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}