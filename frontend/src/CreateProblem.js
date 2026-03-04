import { useState } from "react";
import axios from "axios";

function CreateProblem() {
  const [operand1, setOperand1] = useState("");
  const [operand2, setOperand2] = useState("");
  const [operation, setOperation] = useState("+");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/create-problem", {
        operand1,
        operand2,
        operation,
        correct_answer: correctAnswer,
        explanation
      });

      alert("Problem created successfully ✅");

      // reset form
      setOperand1("");
      setOperand2("");
      setCorrectAnswer("");
      setExplanation("");

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Create Math Problem</h2>

      {/* Operand 1 */}
      <div>
        <label>Operand 1:</label>
        <input
          type="number"
          value={operand1}
          onChange={(e) => setOperand1(e.target.value)}
        />
      </div>

      {/* Operation */}
      <div>
        <label>Operation:</label>
        <select onChange={(e) => setOperation(e.target.value)}>
          <option value="+">+</option>
          <option value="-">-</option>
          <option value="*">*</option>
          <option value="/">/</option>
        </select>
      </div>

      {/* Operand 2 */}
      <div>
        <label>Operand 2:</label>
        <input
          type="number"
          value={operand2}
          onChange={(e) => setOperand2(e.target.value)}
        />
      </div>

      {/* Correct Answer */}
      <div>
        <label>Correct Answer:</label>
        <input
          type="number"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
        />
      </div>

      {/* Explanation */}
      <div>
        <label>Explanation:</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit}>Create Problem</button>
    </div>
  );
}

export default CreateProblem;