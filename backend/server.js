require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

/* ========================
   DATABASE
   Reads from environment variables set by Railway.
   Locally, reads from .env file.
======================== */
const db = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

db.connect((err) => {
  if (err) console.error("❌ MySQL connection failed:", err);
  else console.log("✅ Connected to MySQL");
});

/* ========================
   ROUTES — STANDARD PROBLEMS
======================== */

app.get("/", (req, res) => res.send("Backend running 🚀"));

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

app.get("/problem/random", (req, res) => {
  db.query("SELECT * FROM problems ORDER BY RAND() LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.json({ message: "No problems yet" });
    res.json(result[0]);
  });
});

app.get("/problem/:id", (req, res) => {
  db.query("SELECT * FROM problems WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Problem not found" });
    res.json(result[0]);
  });
});

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

    if (is_correct) return res.json({ result: "Correct" });
    return res.json({
      result: "Wrong",
      correct_answer: problem.correct_answer,
      explanation: problem.explanation,
    });
  });
});

/* ========================
   ROUTES — LARGEST QUOTIENT
======================== */

app.post("/lq-problem", (req, res) => {
  const { digit1, digit2, digit3, best_quotient, explanation } = req.body;
  const sql = `INSERT INTO lq_problems (digit1, digit2, digit3, best_quotient, explanation)
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [digit1, digit2, digit3, best_quotient, explanation], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "LQ problem created ✅" });
  });
});

app.get("/lq-problem/random", (req, res) => {
  db.query("SELECT * FROM lq_problems ORDER BY RAND() LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.json({ message: "No LQ problems yet" });
    res.json(result[0]);
  });
});

app.post("/lq-submit", (req, res) => {
  const { lq_problem_id, is_correct } = req.body;
  db.query("SELECT * FROM lq_problems WHERE id = ?", [lq_problem_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "LQ problem not found" });

    const problem = result[0];
    db.query(
      "INSERT INTO lq_answers (lq_problem_id, is_correct) VALUES (?, ?)",
      [lq_problem_id, is_correct]
    );

    if (is_correct) return res.json({ result: "Correct" });
    return res.json({
      result: "Wrong",
      best_quotient: problem.best_quotient,
      digit1: problem.digit1,
      digit2: problem.digit2,
      digit3: problem.digit3,
      explanation: problem.explanation,
    });
  });
});

/* ========================
   ROUTES — RANDOM ANY
======================== */
app.get("/random-problem", (req, res) => {
  const pickLQ = Math.random() < 0.5;
  const query = pickLQ
    ? "SELECT *, 'lq' AS source FROM lq_problems ORDER BY RAND() LIMIT 1"
    : "SELECT *, 'standard' AS source FROM problems ORDER BY RAND() LIMIT 1";

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));