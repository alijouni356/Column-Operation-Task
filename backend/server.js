const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

/* ========================
   DATABASE
   SQLite — single file, no installation needed.
   Creates database.db automatically on first run.
======================== */
const db = new Database(path.join(__dirname, "database.db"));

// Create all tables automatically on startup
db.exec(`
  CREATE TABLE IF NOT EXISTS problems (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    operand1       TEXT NOT NULL,
    operand2       TEXT NOT NULL,
    operation      TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation    TEXT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS student_answers (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id     INTEGER NOT NULL,
    student_answer TEXT NOT NULL,
    is_correct     INTEGER NOT NULL,
    answered_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problem_id) REFERENCES problems(id)
  );

  CREATE TABLE IF NOT EXISTS lq_problems (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    digit1         INTEGER NOT NULL,
    digit2         INTEGER NOT NULL,
    digit3         INTEGER NOT NULL,
    best_quotient  REAL NOT NULL,
    explanation    TEXT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lq_answers (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    lq_problem_id  INTEGER NOT NULL,
    is_correct     INTEGER NOT NULL,
    answered_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lq_problem_id) REFERENCES lq_problems(id)
  );
`);

console.log("✅ SQLite database ready");

/* ========================
   ROUTES — STANDARD PROBLEMS
======================== */

app.get("/", (req, res) => res.send("Backend running 🚀"));

// Create standard problem
app.post("/problem", (req, res) => {
  try {
    const { operand1, operand2, correct_answer, explanation } = req.body;
    const operation = String(req.body.operation).trim();
    const stmt = db.prepare(`
      INSERT INTO problems (operand1, operand2, operation, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(operand1, operand2, operation, correct_answer, explanation);
    res.json({ message: "Problem created ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get random standard problem
app.get("/problem/random", (req, res) => {
  try {
    const problem = db.prepare("SELECT * FROM problems ORDER BY RANDOM() LIMIT 1").get();
    if (!problem) return res.json({ message: "No problems yet" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get standard problem by ID
app.get("/problem/:id", (req, res) => {
  try {
    const problem = db.prepare("SELECT * FROM problems WHERE id = ?").get(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit answer for standard problem
app.post("/submit-answer", (req, res) => {
  try {
    const { problem_id, student_answer } = req.body;
    const problem = db.prepare("SELECT * FROM problems WHERE id = ?").get(problem_id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const is_correct = Math.abs(Number(student_answer) - Number(problem.correct_answer)) < 0.01 ? 1 : 0;

    db.prepare(
      "INSERT INTO student_answers (problem_id, student_answer, is_correct) VALUES (?, ?, ?)"
    ).run(problem_id, student_answer, is_correct);

    if (is_correct) return res.json({ result: "Correct" });
    return res.json({
      result: "Wrong",
      correct_answer: problem.correct_answer,
      explanation: problem.explanation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ========================
   ROUTES — LARGEST QUOTIENT
======================== */

// Create LQ problem
app.post("/lq-problem", (req, res) => {
  try {
    const { digit1, digit2, digit3, best_quotient, explanation } = req.body;
    db.prepare(`
      INSERT INTO lq_problems (digit1, digit2, digit3, best_quotient, explanation)
      VALUES (?, ?, ?, ?, ?)
    `).run(digit1, digit2, digit3, best_quotient, explanation);
    res.json({ message: "LQ problem created ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get random LQ problem
app.get("/lq-problem/random", (req, res) => {
  try {
    const problem = db.prepare("SELECT * FROM lq_problems ORDER BY RANDOM() LIMIT 1").get();
    if (!problem) return res.json({ message: "No LQ problems yet" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit LQ answer
app.post("/lq-submit", (req, res) => {
  try {
    const { lq_problem_id, is_correct } = req.body;
    const problem = db.prepare("SELECT * FROM lq_problems WHERE id = ?").get(lq_problem_id);
    if (!problem) return res.status(404).json({ message: "LQ problem not found" });

    db.prepare(
      "INSERT INTO lq_answers (lq_problem_id, is_correct) VALUES (?, ?)"
    ).run(lq_problem_id, is_correct ? 1 : 0);

    if (is_correct) return res.json({ result: "Correct" });
    return res.json({
      result: "Wrong",
      best_quotient: problem.best_quotient,
      digit1: problem.digit1,
      digit2: problem.digit2,
      digit3: problem.digit3,
      explanation: problem.explanation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ========================
   ROUTES — RANDOM ANY
======================== */
app.get("/random-problem", (req, res) => {
  try {
    const pickLQ = Math.random() < 0.5;

    let problem = pickLQ
      ? db.prepare("SELECT *, 'lq' AS source FROM lq_problems ORDER BY RANDOM() LIMIT 1").get()
      : db.prepare("SELECT *, 'standard' AS source FROM problems ORDER BY RANDOM() LIMIT 1").get();

    // Fallback to the other table if first is empty
    if (!problem) {
      problem = pickLQ
        ? db.prepare("SELECT *, 'standard' AS source FROM problems ORDER BY RANDOM() LIMIT 1").get()
        : db.prepare("SELECT *, 'lq' AS source FROM lq_problems ORDER BY RANDOM() LIMIT 1").get();
    }

    if (!problem) return res.json({ message: "No problems yet" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ========================
   START
======================== */
app.listen(5000, () => console.log("🚀 Server on port 5000"));