import { useState, useEffect } from "react";

function computeSteps(dividend, divisor) {
  const steps = [];
  let remaining = dividend;

  while (remaining >= divisor) {
    let partial = 1;
    let candidate = divisor;
    while (candidate * 10 <= remaining) {
      candidate *= 10;
      partial *= 10;
    }
    const times = Math.floor(remaining / candidate);
    const actualPartial = times * partial;
    const subtracted = actualPartial * divisor;
    remaining = remaining - subtracted;
    steps.push({
      partial: actualPartial,
      subtracted,
      remainderAfter: remaining,
    });
  }

  return {
    steps,
    quotient: steps.reduce((s, st) => s + st.partial, 0),
    remainder: remaining,
  };
}

// A read-only operation display — used for both student attempt and correct answer
function OperationDisplay({ dividend, divisor, steps, quotient, remainder, partials, remainders, finalQ, finalR, isCorrectVersion }) {

  const cellStyle = (studentVal, correctVal) => {
    if (isCorrectVersion) return "pq-input pq-read-correct";
    const isWrong = parseInt(studentVal) !== correctVal;
    return isWrong ? "pq-input pq-read-wrong" : "pq-input pq-read-ok";
  };

  return (
    <div className={`pq-layout ${isCorrectVersion ? "pq-layout-correct" : "pq-layout-student"}`}>

      {/* Label */}
      <div className="pq-version-label">
        {isCorrectVersion ? "✅ Correct Answer" : "❌ Your Answer"}
      </div>

      {/* TOP ROW: quotient R remainder */}
      <div className="pq-top-row">
        <input type="number" readOnly
          className={cellStyle(finalQ, quotient)}
          value={isCorrectVersion ? quotient : finalQ}
        />
        <span className="pq-r-label">R</span>
        <input type="number" readOnly
          className={cellStyle(finalR, remainder)}
          value={isCorrectVersion ? remainder : finalR}
        />
      </div>

      {/* DIVISION BAR */}
      <div className="pq-division-bar">
        <span className="pq-divisor">{divisor}</span>
        <span className="pq-bracket">)</span>
        <span className="pq-dividend">{dividend}</span>
      </div>

      {/* STEPS */}
      {steps.map((step, i) => (
        <div key={i} className="pq-step-group">
          <div className="pq-subtract-row">
            <span className="pq-minus">−</span>
            <span className="pq-subtracted">{step.subtracted}</span>
            <span className="pq-arrow">←</span>
            <input type="number" readOnly
              className={`pq-input pq-input-sm ${isCorrectVersion
                ? "pq-read-correct"
                : parseInt(partials[i]) !== step.partial ? "pq-read-wrong" : "pq-read-ok"
              }`}
              value={isCorrectVersion ? step.partial : partials[i]}
            />
            <span className="pq-x-divisor">× {divisor}</span>
          </div>
          <div className="pq-underline" />
          <div className="pq-remainder-row">
            <input type="number" readOnly
              className={cellStyle(remainders[i], step.remainderAfter)}
              value={isCorrectVersion ? step.remainderAfter : remainders[i]}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartialQuotient({ dividend, divisor, onSubmit, onRetry }) {
  const { steps, quotient, remainder } = computeSteps(dividend, divisor);

  const [partials, setPartials]     = useState(steps.map(() => ""));
  const [remainders, setRemainders] = useState(steps.map(() => ""));
  const [finalQ, setFinalQ]         = useState("");
  const [finalR, setFinalR]         = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [correct, setCorrect]       = useState(null);

  // Snapshots of what the student answered — frozen at submit time
  const [snapPartials,   setSnapPartials]   = useState([]);
  const [snapRemainders, setSnapRemainders] = useState([]);
  const [snapFinalQ,     setSnapFinalQ]     = useState("");
  const [snapFinalR,     setSnapFinalR]     = useState("");

  useEffect(() => {
    const { steps: s } = computeSteps(dividend, divisor);
    setPartials(s.map(() => ""));
    setRemainders(s.map(() => ""));
    setFinalQ("");
    setFinalR("");
    setSubmitted(false);
    setCorrect(null);
    setSnapPartials([]);
    setSnapRemainders([]);
    setSnapFinalQ("");
    setSnapFinalR("");
  }, [dividend, divisor]);

  const setPartial   = (i, val) => setPartials(p  => p.map((v, j) => j === i ? val : v));
  const setRemainder = (i, val) => setRemainders(r => r.map((v, j) => j === i ? val : v));

  const StepInput = ({ value, onChange, small }) => (
    <input
      type="number"
      className={`pq-input${small ? " pq-input-sm" : ""}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={submitted}
    />
  );

  const handleSubmit = () => {
    const qCorrect = parseInt(finalQ) === quotient;
    const rCorrect = parseInt(finalR) === remainder;
    const isCorrect = qCorrect && rCorrect;

    // Freeze a snapshot of student answers before any state changes
    setSnapPartials([...partials]);
    setSnapRemainders([...remainders]);
    setSnapFinalQ(finalQ);
    setSnapFinalR(finalR);

    setSubmitted(true);
    setCorrect(isCorrect);
    onSubmit(isCorrect, quotient, remainder);
  };

  return (
    <div className="pq-wrapper">
      <p className="pq-instruction">
        Use the partial quotients method to find <strong>{dividend} ÷ {divisor}</strong>. Fill in the missing numbers.
      </p>

      {/* ── INPUT MODE: before submit ── */}
      {!submitted && (
        <div className="pq-layout">
          <div className="pq-top-row">
            <StepInput value={finalQ} onChange={setFinalQ} />
            <span className="pq-r-label">R</span>
            <StepInput value={finalR} onChange={setFinalR} />
          </div>

          <div className="pq-division-bar">
            <span className="pq-divisor">{divisor}</span>
            <span className="pq-bracket">)</span>
            <span className="pq-dividend">{dividend}</span>
          </div>

          {steps.map((step, i) => (
            <div key={i} className="pq-step-group">
              <div className="pq-subtract-row">
                <span className="pq-minus">−</span>
                <span className="pq-subtracted">{step.subtracted}</span>
                <span className="pq-arrow">←</span>
                <StepInput value={partials[i]} onChange={v => setPartial(i, v)} small />
                <span className="pq-x-divisor">× {divisor}</span>
              </div>
              <div className="pq-underline" />
              <div className="pq-remainder-row">
                <StepInput value={remainders[i]} onChange={v => setRemainder(i, v)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RESULT MODE: after submit ── */}
      {submitted && (
        <>
          <div className={`pq-result ${correct ? "pq-result-correct" : "pq-result-wrong"}`}>
            {correct ? "🎉 Correct!" : "❌ Wrong — see the correct answers below"}
          </div>

          <div className={`pq-compare ${correct ? "" : "pq-compare-two"}`}>
            {/* Always show student's answer */}
            <OperationDisplay
              dividend={dividend}
              divisor={divisor}
              steps={steps}
              quotient={quotient}
              remainder={remainder}
              partials={snapPartials}
              remainders={snapRemainders}
              finalQ={snapFinalQ}
              finalR={snapFinalR}
              isCorrectVersion={false}
            />

            {/* Only show correct version if wrong */}
            {!correct && (
              <OperationDisplay
                dividend={dividend}
                divisor={divisor}
                steps={steps}
                quotient={quotient}
                remainder={remainder}
                partials={steps.map(s => String(s.partial))}
                remainders={steps.map(s => String(s.remainderAfter))}
                finalQ={String(quotient)}
                finalR={String(remainder)}
                isCorrectVersion={true}
              />
            )}
          </div>

          {/* Buttons after submit */}
          <div className="pq-action-row">
            {!correct && (
              <button className="pq-retry-btn" onClick={() => {
                const { steps: s } = computeSteps(dividend, divisor);
                setPartials(s.map(() => ""));
                setRemainders(s.map(() => ""));
                setFinalQ("");
                setFinalR("");
                setSubmitted(false);
                setCorrect(null);
                setSnapPartials([]);
                setSnapRemainders([]);
                setSnapFinalQ("");
                setSnapFinalR("");
                if (onRetry) onRetry();
              }}>
                ↺ Try Again
              </button>
            )}
          </div>
        </>
      )}

      {!submitted && (
        <button className="submit-btn pq-submit" onClick={handleSubmit}>
          Submit →
        </button>
      )}
    </div>
  );
}