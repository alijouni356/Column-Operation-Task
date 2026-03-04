import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Student() {
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null); // { result, correct_answer, explanation }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const loadProblem = () => {
    setLoading(true);
    setResult(null);
    setAnswer("");
    axios
      .get("http://localhost:5000/problem/random")
      .then((res) => {
        setProblem(res.data.message ? null : res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadProblem(); }, []);

  const handleSubmit = async () => {
    if (!answer) return;
    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5000/submit-answer", {
        problem_id: problem.id,
        student_answer: answer,
      });
      setResult(res.data);
      if (res.data.result === "Wrong") {
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const opSymbol = { "+": "＋", "-": "－", "*": "×", "/": "÷" };

  return (
    <div className="page student-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
        <h2>Solve It!</h2>
        <button className="next-btn" onClick={loadProblem}>Next →</button>
      </header>

      <div className="student-center">
        {loading && (
          <div className="card solve-card loading-card">
            <div className="loader" />
            <p>Loading problem…</p>
          </div>
        )}

        {!loading && !problem && (
          <div className="card solve-card empty-card">
            <span className="empty-icon">📭</span>
            <p>No problems yet. Ask your admin to add some!</p>
          </div>
        )}

        {!loading && problem && (
          <div className={`card solve-card ${shake ? "shake" : ""}`}>
            <p className="problem-label">Problem #{problem.id}</p>

            <div className="column-display">
              <div className="col-num">{problem.operand1}</div>
              <div className="col-op-row">
                <span className="col-op-symbol">
                  {opSymbol[problem.operation] || problem.operation}
                </span>
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
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoFocus
                />
                <button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
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