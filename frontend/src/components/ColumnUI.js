// src/components/ColumnUI.js
import React, { useState } from "react";

function ColumnUI({ problem }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState(null);

  const checkAnswer = () => {
    if (parseInt(userAnswer) === problem.correct_answer) {
      setResult("Correct ✅");
    } else {
      setResult("Wrong ❌");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Solve</h2>

      <div style={{ fontSize: "30px", lineHeight: "50px" }}>
        <div>{problem.operand1}</div>
        <div>
          {problem.operation} {problem.operand2}
        </div>
        <hr style={{ width: "100px" }} />
      </div>

      <input
        placeholder="Your answer"
        onChange={e => setUserAnswer(e.target.value)}
      />

      <br /><br />

      <button onClick={checkAnswer}>Submit</button>

      {result && <h3>{result}</h3>}
    </div>
  );
}

export default ColumnUI;