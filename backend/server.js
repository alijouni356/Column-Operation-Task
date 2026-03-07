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
   ROUTES — STANDARD PROBLEMS
   Table: problems
   (operand1, operand2, operation, correct_answer, explanation)
======================== */

app.get("/", (req, res) => res.send("Backend running 🚀"));

// Create standard problem (Admin)
app.post("/problem", (req, res) => {
  const { operand1, operand2, correct_answer, explanation } = req.body;
  const operation = String(req.body.operation).trim();
  const sql = `INSERT INTO problems (operand1, operand2, operation, correct_answer, explanation)
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [operand1, operand2, operation, correct_answer, explanation], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Problem created ✅" });
  });
});

// Get random standard problem
app.get("/problem/random", (req, res) => {
  db.query("SELECT * FROM problems ORDER BY RAND() LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.json({ message: "No problems yet" });
    res.json(result[0]);
  });
});

// Get standard problem by ID
app.get("/problem/:id", (req, res) => {
  db.query("SELECT * FROM problems WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Problem not found" });
    res.json(result[0]);
  });
});

// Submit answer for standard problem
app.post("/submit-answer", (req, res) => {
  const { problem_id, student_answer } = req.body;
  db.query("SELECT * FROM problems WHERE id = ?", [problem_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Problem not found" });

    const problem = result[0];
    const is_correct = Math.abs(Number(student_answer) - Number(problem.correct_answer)) < 0.01;

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
   ROUTES — LARGEST QUOTIENT
   Table: lq_problems
   (digit1, digit2, digit3, best_quotient, explanation)
======================== */

// Create LQ problem (Admin)
app.post("/lq-problem", (req, res) => {
  const { digit1, digit2, digit3, best_quotient, explanation } = req.body;
  const sql = `INSERT INTO lq_problems (digit1, digit2, digit3, best_quotient, explanation)
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [digit1, digit2, digit3, best_quotient, explanation], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "LQ problem created ✅" });
  });
});

// Get random LQ problem (Student)
app.get("/lq-problem/random", (req, res) => {
  db.query("SELECT * FROM lq_problems ORDER BY RAND() LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.json({ message: "No LQ problems yet" });
    res.json(result[0]);
  });
});

// Submit answer for LQ problem
app.post("/lq-submit", (req, res) => {
  const { lq_problem_id, is_correct } = req.body;

  db.query("SELECT * FROM lq_problems WHERE id = ?", [lq_problem_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "LQ problem not found" });

    const problem = result[0];

    // Save attempt
    db.query(
      "INSERT INTO lq_answers (lq_problem_id, is_correct) VALUES (?, ?)",
      [lq_problem_id, is_correct]
    );

    if (is_correct) {
      return res.json({ result: "Correct" });
    } else {
      return res.json({
        result: "Wrong",
        best_quotient: problem.best_quotient,
        digit1: problem.digit1,
        digit2: problem.digit2,
        digit3: problem.digit3,
        explanation: problem.explanation,
      });
    }
  });
});

/* ========================
   ROUTES — RANDOM ANY (Student homepage)
   Picks randomly from both tables
======================== */
app.get("/random-problem", (req, res) => {
  // Randomly pick which table to pull from
  const pickLQ = Math.random() < 0.5;
  const query = pickLQ
    ? "SELECT *, 'lq' AS source FROM lq_problems ORDER BY RAND() LIMIT 1"
    : "SELECT *, 'standard' AS source FROM problems ORDER BY RAND() LIMIT 1";

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      // Try the other table as fallback
      const fallback = pickLQ
        ? "SELECT *, 'standard' AS source FROM problems ORDER BY RAND() LIMIT 1"
        : "SELECT *, 'lq' AS source FROM lq_problems ORDER BY RAND() LIMIT 1";
      db.query(fallback, (err2, result2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        if (result2.length === 0) return res.json({ message: "No problems yet" });
        res.json(result2[0]);
      });
    } else {
      res.json(result[0]);
    }
  });
});

/* ========================
   START
======================== */
app.listen(5000, () => console.log("🚀 Server on port 5000"));