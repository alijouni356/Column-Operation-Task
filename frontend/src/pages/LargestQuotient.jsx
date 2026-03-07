import { useState, useEffect } from "react";

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((v, i) =>
    permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [v, ...p])
  );
}

function bestArrangement(digits) {
  let best = null, bestVal = -Infinity;
  for (const [a, b, c] of permutations(digits)) {
    if (c === 0) continue;
    const val = (a * b) / c;
    if (val > bestVal) { bestVal = val; best = { a, b, c, val }; }
  }
  return best;
}

export default function LargestQuotient({ digits, onSubmit }) {
  const [boxes, setBoxes]         = useState([null, null, null]);
  const [available, setAvail]     = useState([...digits]);
  const [dragging, setDragging]   = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect]     = useState(null);

  const best = bestArrangement(digits);

  useEffect(() => {
    setBoxes([null, null, null]);
    setAvail([...digits]);
    setSubmitted(false);
    setCorrect(null);
  }, [digits.join(",")]);

  const onChipDragStart = (digit, chipIdx) =>
    setDragging({ digit, from: "chip", index: chipIdx });

  const onBoxDragStart = (boxIdx) => {
    if (boxes[boxIdx] === null || submitted) return;
    setDragging({ digit: boxes[boxIdx], from: "box", index: boxIdx });
  };

  const onBoxDrop = (boxIdx) => {
    if (!dragging) return;
    const newBoxes = [...boxes];
    const newAvail = [...available];
    const displaced = newBoxes[boxIdx];
    newBoxes[boxIdx] = dragging.digit;
    if (dragging.from === "chip") {
      newAvail.splice(newAvail.indexOf(dragging.digit), 1);
    } else {
      newBoxes[dragging.index] = null;
    }
    if (displaced !== null) newAvail.push(displaced);
    setBoxes(newBoxes);
    setAvail(newAvail);
    setDragging(null);
  };

  const onBankDrop = () => {
    if (!dragging || dragging.from !== "box") return;
    const newBoxes = [...boxes];
    const newAvail = [...available];
    newAvail.push(newBoxes[dragging.index]);
    newBoxes[dragging.index] = null;
    setBoxes(newBoxes);
    setAvail(newAvail);
    setDragging(null);
  };

  const allFilled = boxes.every(b => b !== null);

  const handleSubmit = () => {
    const [a, b, c] = boxes;
    const isCorrect = a === best.a && b === best.b && c === best.c;
    setSubmitted(true);
    setCorrect(isCorrect);
    // Notify Student.jsx with result — Student handles Next button
    onSubmit(isCorrect);
  };

  const handleReset = () => {
    setBoxes([null, null, null]);
    setAvail([...digits]);
    setSubmitted(false);
    setCorrect(null);
  };

  const s = styles;

  return (
    <div style={s.wrapper}>
      {/* Instruction */}
      <p style={s.instruction}>
        Make the <strong>largest quotient possible</strong> using the numbers below.
        Use each number <strong>exactly once</strong>.
      </p>

      {/* Number chip bank */}
      <div style={s.bankLabel}>Available numbers</div>
      <div
        style={s.bank}
        onDragOver={e => e.preventDefault()}
        onDrop={onBankDrop}
      >
        {available.length === 0
          ? <span style={s.bankEmpty}>Drop here to return a number</span>
          : available.map((d, i) => (
              <div
                key={i}
                style={s.chip}
                draggable
                onDragStart={() => onChipDragStart(d, i)}
              >
                {d}
              </div>
            ))
        }
      </div>

      {/* Formula layout: [ □ ] × [ □ ] over [ □ ] */}
      <div style={s.formulaWrapper}>
        <div style={s.formulaLabel}>Arrange the numbers</div>
        <div style={s.equation}>
          {/* Numerator: □ × □ */}
          <div style={s.topRow}>
            <DropBox
              value={boxes[0]} boxIdx={0}
              onDrop={onBoxDrop} onDragStart={onBoxDragStart}
              submitted={submitted} correct={submitted && boxes[0] === best.a}
            />
            <span style={s.opSymbol}>×</span>
            <DropBox
              value={boxes[1]} boxIdx={1}
              onDrop={onBoxDrop} onDragStart={onBoxDragStart}
              submitted={submitted} correct={submitted && boxes[1] === best.b}
            />
          </div>

          {/* Division line */}
          <div style={s.divLine} />

          {/* Denominator: □ */}
          <div style={s.bottomRow}>
            <DropBox
              value={boxes[2]} boxIdx={2}
              onDrop={onBoxDrop} onDragStart={onBoxDragStart}
              submitted={submitted} correct={submitted && boxes[2] === best.c}
            />
          </div>
        </div>

        {/* Live quotient preview */}
        {allFilled && !submitted && (
          <div style={s.liveVal}>
            = {((boxes[0] * boxes[1]) / boxes[2]).toFixed(2)}
          </div>
        )}
      </div>

      {/* Result banner — shown after submit */}
      {submitted && (
        <div style={{ ...s.resultBanner, ...(correct ? s.resultCorrect : s.resultWrong) }}>
          {correct
            ? `🎉 Correct! ${best.a} × ${best.b} ÷ ${best.c} = ${best.val.toFixed(2)} is the largest!`
            : `❌ Not quite — the best is ${best.a} × ${best.b} ÷ ${best.c} = ${best.val.toFixed(2)}`
          }
        </div>
      )}

      {/* Action buttons — hide after submit (Student.jsx shows Next) */}
      {!submitted && (
        <div style={s.actions}>
          <button style={s.resetBtn} onClick={handleReset}>↺ Reset</button>
          <button
            style={{ ...s.submitBtn, ...(!allFilled ? s.submitBtnDisabled : {}) }}
            onClick={handleSubmit}
            disabled={!allFilled}
          >
            Submit →
          </button>
        </div>
      )}

      {/* Try Again shown after wrong submission */}
      {submitted && !correct && (
        <button style={{ ...s.resetBtn, width: "100%", textAlign: "center" }} onClick={handleReset}>
          ↺ Try Again
        </button>
      )}
    </div>
  );
}

function DropBox({ value, boxIdx, onDrop, onDragStart, submitted, correct }) {
  const [over, setOver] = useState(false);
  const s = styles;
  return (
    <div
      style={{
        ...s.box,
        ...(value !== null ? s.boxFilled : {}),
        ...(over ? s.boxOver : {}),
        ...(submitted && value !== null ? (correct ? s.boxCorrect : s.boxWrong) : {}),
      }}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); onDrop(boxIdx); }}
      draggable={value !== null && !submitted}
      onDragStart={() => onDragStart(boxIdx)}
    >
      {value !== null ? value : <span style={s.boxPlaceholder}>?</span>}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "16px",
    fontFamily: "'Nunito', sans-serif",
  },
  instruction: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#9b8b7e",
    lineHeight: 1.6,
    margin: 0,
    padding: "12px 16px",
    background: "#fff8e1",
    borderRadius: "10px",
    border: "1.5px solid #fcd34d",
  },
  bankLabel: {
    fontSize: "0.75rem",
    fontWeight: 800,
    color: "#9b8b7e",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  bank: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    minHeight: "80px",
    background: "#fdf6ec",
    border: "2.5px dashed #e8d9c5",
    borderRadius: "14px",
    padding: "14px 16px",
    alignItems: "center",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  bankEmpty: {
    color: "#9b8b7e",
    fontSize: "0.85rem",
    fontWeight: 600,
    fontStyle: "italic",
  },
  chip: {
    width: "60px",
    height: "60px",
    background: "#3a86ff",
    color: "white",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Fredoka One', cursive",
    fontSize: "1.8rem",
    cursor: "grab",
    userSelect: "none",
    boxShadow: "0 4px 14px rgba(58,134,255,0.4)",
  },
  formulaWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "24px",
    background: "#f8f4f0",
    borderRadius: "16px",
    border: "2px solid #e8d9c5",
  },
  formulaLabel: {
    fontSize: "0.75rem",
    fontWeight: 800,
    color: "#9b8b7e",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  equation: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  opSymbol: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: "2.4rem",
    color: "#ff6b35",
    lineHeight: 1,
  },
  divLine: {
    width: "200px",
    height: "3px",
    background: "#2c2320",
    borderRadius: "2px",
    margin: "6px 0",
  },
  bottomRow: {
    display: "flex",
    justifyContent: "center",
  },
  box: {
    width: "72px",
    height: "72px",
    border: "2.5px dashed #c8b8a8",
    borderRadius: "14px",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Fredoka One', cursive",
    fontSize: "2.2rem",
    color: "#2c2320",
    cursor: "default",
    userSelect: "none",
    boxSizing: "border-box",
    transition: "all 0.15s",
  },
  boxFilled: {
    borderStyle: "solid",
    borderColor: "#3a86ff",
    background: "#edf2ff",
    cursor: "grab",
    boxShadow: "0 3px 10px rgba(58,134,255,0.2)",
  },
  boxOver: {
    borderColor: "#ff6b35",
    background: "#fff2ed",
    boxShadow: "0 0 0 4px rgba(255,107,53,0.2)",
  },
  boxCorrect: {
    borderColor: "#2ecc71",
    background: "#eafaf1",
    color: "#2ecc71",
    boxShadow: "0 3px 10px rgba(46,204,113,0.2)",
  },
  boxWrong: {
    borderColor: "#e74c3c",
    background: "#fdf2f0",
    color: "#e74c3c",
  },
  boxPlaceholder: {
    color: "#c8b8a8",
    fontSize: "1.4rem",
    fontFamily: "'Fredoka One', cursive",
  },
  liveVal: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: "1.6rem",
    color: "#3a86ff",
    textAlign: "center",
  },
  resultBanner: {
    padding: "16px 20px",
    borderRadius: "12px",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: "1rem",
    textAlign: "center",
    boxSizing: "border-box",
  },
  resultCorrect: {
    background: "#eafaf1",
    color: "#27ae60",
    border: "2px solid #2ecc71",
  },
  resultWrong: {
    background: "#fdf2f0",
    color: "#e74c3c",
    border: "2px solid #e74c3c",
  },
  actions: {
    display: "flex",
    gap: "12px",
  },
  resetBtn: {
    flexShrink: 0,
    padding: "14px 20px",
    background: "#fdf6ec",
    border: "2px solid #e8d9c5",
    borderRadius: "14px",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: "0.95rem",
    cursor: "pointer",
    color: "#9b8b7e",
  },
  submitBtn: {
    flex: 1,
    padding: "14px 24px",
    background: "#3a86ff",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: "1.05rem",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(58,134,255,0.3)",
  },
  submitBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};