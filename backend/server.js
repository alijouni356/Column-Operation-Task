const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

/* ========================
   DATABASE
======================== */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "column_op",
  port: 3306,
});

db.connect((err) => {
  if (err) console.error("❌ MySQL connection failed:", err);
  else console.log("✅ Connected to MySQL");
});

/* ========================
   ROUTES
======================== */

// Health check
app.get("/", (req, res) => res.send("Backend running 🚀"));

// Create problem (Admin)
app.post("/problem", (req, res) => {
  const { operand1, operand2, operation, correct_answer, explanation } = req.body;

  const sql = `INSERT INTO problems (operand1, operand2, operation, correct_answer, explanation)
               VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [operand1, operand2, operation, correct_answer, explanation], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Problem created ✅" });
  });
});

// Get random problem (Student)
app.get("/problem/random", (req, res) => {
  db.query("SELECT * FROM problems ORDER BY RAND() LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.json({ message: "No problems yet" });
    res.json(result[0]);
  });
});

// Get problem by ID
app.get("/problem/:id", (req, res) => {
  db.query("SELECT * FROM problems WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Problem not found" });
    res.json(result[0]);
  });
});

// Submit answer (Student)
app.post("/submit-answer", (req, res) => {
  const { problem_id, student_answer } = req.body;

  db.query("SELECT * FROM problems WHERE id = ?", [problem_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Problem not found" });

    const problem = result[0];
    const is_correct = Number(student_answer) === Number(problem.correct_answer);

    // Save attempt
    db.query(
      "INSERT INTO student_answers (problem_id, student_answer, is_correct) VALUES (?, ?, ?)",
      [problem_id, student_answer, is_correct]
    );

    if (is_correct) {
      return res.json({ result: "Correct" });
    } else {
      return res.json({
        result: "Wrong",
        correct_answer: problem.correct_answer,
        explanation: problem.explanation,
      });
    }
  });
});

/* ========================
   START
======================== */
app.listen(5000, () => console.log("🚀 Server on port 5000"));