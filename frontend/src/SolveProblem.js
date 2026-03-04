import { useEffect, useState } from "react";
import axios from "axios";

function SolveProblem() {
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/problem/1")
      .then((res) => {
        console.log("DATA:", res.data);
        setProblem(res.data);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        setError("Failed to load problem");
      });
  }, []);

  const submitAnswer = async () => {
    try {
      const res = await axios.post("http://localhost:5000/submit-answer", {
        problem_id: problem.id,
        student_answer: answer,
      });

      setResult(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (error) return <h2>{error}</h2>;
  if (!problem) return <h2>Loading...</h2>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Solve the Problem</h2>

      <div style={{ fontSize: "30px", fontFamily: "monospace" }}>
        <div>{problem.operand1}</div>
        <div>
          {problem.operation} {problem.operand2}
        </div>
        <div>------</div>
        <div>?</div>
      </div>

      <input
        type="number"
        placeholder="Your answer"
        onChange={(e) => setAnswer(e.target.value)}
        style={{ marginTop: "20px", padding: "10px" }}
      />

      <br />

      <button onClick={submitAnswer} style={{ marginTop: "10px" }}>
        Submit
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>{result.result}</h3>

          {result.result === "False" && (
            <>
              <p>Correct Answer: {result.correct_answer}</p>
              <p>{result.explanation}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SolveProblem;