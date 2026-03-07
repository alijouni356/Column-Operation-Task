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

export default function PartialQuotient({ dividend, divisor, onSubmit }) {
  const { steps, quotient, remainder } = computeSteps(dividend, divisor);

  const [partials, setPartials]     = useState(steps.map(() => ""));
  const [remainders, setRemainders] = useState(steps.map(() => ""));
  const [finalQ, setFinalQ]         = useState("");
  const [finalR, setFinalR]         = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [correct, setCorrect]       = useState(null);

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

    // If wrong: replace each wrong box value with the correct answer directly
    if (!isCorrect) {
      setPartials(p => p.map((v, i) =>
        parseInt(v) !== steps[i].partial ? String(steps[i].partial) : v
      ));
      setRemainders(r => r.map((v, i) =>
        parseInt(v) !== steps[i].remainderAfter ? String(steps[i].remainderAfter) : v
      ));
      if (!qCorrect) setFinalQ(String(quotient));
      if (!rCorrect) setFinalR(String(remainder));
    }

    setSubmitted(true);
    setCorrect(isCorrect);
    onSubmit(isCorrect, quotient, remainder);
  };

  const setPartial   = (i, val) => setPartials(p  => p.map((v, j) => j === i ? val : v));
  const setRemainder = (i, val) => setRemainders(r => r.map((v, j) => j === i ? val : v));

  // Whether a value was originally wrong (to color it differently)
  const [wrongPartials,   setWrongPartials]   = useState([]);
  const [wrongRemainders, setWrongRemainders] = useState([]);
  const [wrongFinalQ,     setWrongFinalQ]     = useState(false);
  const [wrongFinalR,     setWrongFinalR]     = useState(false);

  const handleSubmitWithTracking = () => {
    // Track which were wrong BEFORE replacing
    setWrongPartials(partials.map((v, i) => parseInt(v) !== steps[i].partial));
    setWrongRemainders(remainders.map((v, i) => parseInt(v) !== steps[i].remainderAfter));
    setWrongFinalQ(parseInt(finalQ) !== quotient);
    setWrongFinalR(parseInt(finalR) !== remainder);
    handleSubmit();
  };

  const StepInput = ({ value, onChange, isWrong, small }) => (
    <input
      type="number"
      className={[
        "pq-input",
        small ? "pq-input-sm" : "",
        submitted ? (isWrong ? "pq-corrected" : "pq-right") : "",
      ].join(" ")}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={submitted}
    />
  );

  return (
    <div className="pq-wrapper">
      <p className="pq-instruction">
        Use the partial quotients method to find <strong>{dividend} ÷ {divisor}</strong>. Fill in the missing numbers.
      </p>

      <div className="pq-layout">

        {/* TOP ROW: quotient  R  remainder */}
        <div className="pq-top-row">
          <StepInput value={finalQ} onChange={setFinalQ} isWrong={wrongFinalQ} />
          <span className="pq-r-label">R</span>
          <StepInput value={finalR} onChange={setFinalR} isWrong={wrongFinalR} />
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
              <StepInput
                value={partials[i]}
                onChange={v => setPartial(i, v)}
                isWrong={wrongPartials[i]}
                small
              />
              <span className="pq-x-divisor">× {divisor}</span>
            </div>
            <div className="pq-underline" />
            <div className="pq-remainder-row">
              <StepInput
                value={remainders[i]}
                onChange={v => setRemainder(i, v)}
                isWrong={wrongRemainders[i]}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Result banner */}
      {submitted && (
        <div className={`pq-result ${correct ? "pq-result-correct" : "pq-result-wrong"}`}>
          {correct
            ? "🎉 Correct!"
            : `❌ Wrong — the correct answers have been filled in for you`}
        </div>
      )}

      {!submitted && (
        <button className="submit-btn pq-submit" onClick={handleSubmitWithTracking}>
          Submit →
        </button>
      )}
    </div>
  );
}