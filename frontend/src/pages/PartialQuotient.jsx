import { useState, useEffect } from "react";

/*
  Partial Quotient Method layout for  dividend ÷ divisor
  Example: 989 ÷ 43

  Steps are computed automatically from the dividend & divisor.
  Each step = largest round partial quotient that fits.
  Student fills: each partial quotient (right column) + each remainder + final quotient + final remainder.
  Only the final quotient (and remainder) are checked on submit.
*/

function computeSteps(dividend, divisor) {
  const steps = [];
  let remaining = dividend;

  // Choose "nice" partial quotients (powers of 10 multiples of divisor)
  while (remaining >= divisor) {
    // Find the largest multiple of (divisor × 10^n) that fits
    let partial = 1;
    let candidate = divisor;
    while (candidate * 10 <= remaining) {
      candidate *= 10;
      partial *= 10;
    }
    // Now find how many times candidate fits
    const times = Math.floor(remaining / candidate);
    const actualPartial = times * partial;
    const subtracted = actualPartial * divisor;
    remaining = remaining - subtracted;
    steps.push({
      partial: actualPartial,       // the partial quotient (e.g. 10)
      subtracted,                   // what gets subtracted (e.g. 430)
      remainderAfter: remaining,    // remainder after this step
    });
  }

  return {
    steps,
    quotient: steps.reduce((s, st) => s + st.partial, 0),
    remainder: remaining,
  };
}

export default function PartialQuotient({ dividend, divisor, onSubmit }) {
  const { steps, quotient, remainder } = computeSteps(dividend, divisor);

  // Student inputs: one per step (the partial quotient) + remainders + final quotient + final remainder
  const [partials, setPartials]     = useState(steps.map(() => ""));
  const [remainders, setRemainders] = useState(steps.map(() => ""));
  const [finalQ, setFinalQ]         = useState("");
  const [finalR, setFinalR]         = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [correct, setCorrect]       = useState(null);

  // Reset when problem changes
  useEffect(() => {
    const { steps: s } = computeSteps(dividend, divisor);
    setPartials(s.map(() => ""));
    setRemainders(s.map(() => ""));
    setFinalQ("");
    setFinalR("");
    setSubmitted(false);
    setCorrect(null);
  }, [dividend, divisor]);

  const handleSubmit = () => {
    const qCorrect = parseInt(finalQ) === quotient;
    const rCorrect = parseInt(finalR) === remainder;
    const isCorrect = qCorrect && rCorrect;
    setSubmitted(true);
    setCorrect(isCorrect);
    onSubmit(isCorrect, quotient, remainder);
  };

  const setPartial = (i, val) => setPartials(p => p.map((v, j) => j === i ? val : v));
  const setRemainder = (i, val) => setRemainders(r => r.map((v, j) => j === i ? val : v));

  // Show correct values after wrong submission
  const show = (studentVal, correctVal) => {
    if (!submitted) return studentVal;
    const isWrong = parseInt(studentVal) !== correctVal;
    return { value: studentVal, wrong: isWrong, correct: correctVal };
  };

  const StepInput = ({ value, onChange, correctVal, small }) => {
    const wrong = submitted && parseInt(value) !== correctVal;
    const right = submitted && parseInt(value) === correctVal;
    return (
      <span className="pq-input-wrap">
        <input
          type="number"
          className={`pq-input${small ? " pq-input-sm" : ""}${wrong ? " pq-wrong" : ""}${right ? " pq-right" : ""}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={submitted}
        />
        {wrong && <span className="pq-correct-hint">{correctVal}</span>}
      </span>
    );
  };

  return (
    <div className="pq-wrapper">
      <p className="pq-instruction">
        Use the partial quotients method to find <strong>{dividend} ÷ {divisor}</strong>. Fill in the missing numbers.
      </p>

      <div className="pq-layout">

        {/* TOP ROW: quotient box  R  remainder box */}
        <div className="pq-top-row">
          <StepInput value={finalQ} onChange={setFinalQ} correctVal={quotient} />
          <span className="pq-r-label">R</span>
          <StepInput value={finalR} onChange={setFinalR} correctVal={remainder} />
        </div>

        {/* DIVISION BAR: divisor ) dividend */}
        <div className="pq-division-bar">
          <span className="pq-divisor">{divisor}</span>
          <span className="pq-bracket">)</span>
          <span className="pq-dividend">{dividend}</span>
        </div>

        {/* STEPS */}
        {steps.map((step, i) => (
          <div key={i} className="pq-step-group">
            {/* Subtraction row */}
            <div className="pq-subtract-row">
              <span className="pq-minus">−</span>
              <span className="pq-subtracted">{step.subtracted}</span>
              <span className="pq-arrow">←</span>
              <StepInput
                value={partials[i]}
                onChange={v => setPartial(i, v)}
                correctVal={step.partial}
                small
              />
              <span className="pq-x-divisor">× {divisor}</span>
            </div>

            {/* Underline */}
            <div className="pq-underline" />

            {/* Remainder row */}
            <div className="pq-remainder-row">
              <StepInput
                value={remainders[i]}
                onChange={v => setRemainder(i, v)}
                correctVal={step.remainderAfter}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Result banner */}
      {submitted && (
        <div className={`pq-result ${correct ? "pq-result-correct" : "pq-result-wrong"}`}>
          {correct ? "🎉 Correct!" : `❌ Not quite — the answer is ${quotient} R ${remainder}`}
        </div>
      )}

      {!submitted && (
        <button className="submit-btn pq-submit" onClick={handleSubmit}>
          Submit →
        </button>
      )}
    </div>
  );
}