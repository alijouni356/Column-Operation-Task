# 🧮 Column Math System

A full-stack math practice app where admins create problems and students solve them. Supports addition, subtraction, multiplication, division (partial quotients method), and largest quotient exercises.

---

## 📁 Project Structure

```
project/
├── server.js                        ← Express backend (port 5000)
└── src/
    ├── App.jsx                      ← React Router (Home / Admin / Student)
    ├── index.css                    ← Global styles
    └── pages/
        ├── Admin.jsx                ← /admin route — create problems
        ├── Student.jsx              ← /student route — solve problems
        ├── PartialQuotient.jsx      ← Division UI (partial quotients method)
        └── LargestQuotient.jsx      ← Largest quotient drag & drop UI
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [WAMP](https://www.wampserver.com/) or any MySQL server running on port 3306
- npm

---

## 🗄️ Database Setup

Open **phpMyAdmin** (or any MySQL client) and run the following:

### 1. Create the database

```sql
CREATE DATABASE column_op;
USE column_op;
```

### 2. Create the `problems` table

```sql
CREATE TABLE problems (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  operand1       VARCHAR(50)   NOT NULL,
  operand2       VARCHAR(50)   NOT NULL,
  operation      VARCHAR(10)   NOT NULL,
  correct_answer VARCHAR(50)   NOT NULL,
  explanation    TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Create the `student_answers` table

```sql
CREATE TABLE student_answers (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  problem_id     INT          NOT NULL,
  student_answer VARCHAR(50)  NOT NULL,
  is_correct     TINYINT(1)   NOT NULL,
  answered_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (problem_id) REFERENCES problems(id)
);
```

### 4. Create the `lq_problems` table

```sql
CREATE TABLE lq_problems (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  digit1         INT           NOT NULL,
  digit2         INT           NOT NULL,
  digit3         INT           NOT NULL,
  best_quotient  DECIMAL(10,4) NOT NULL,
  explanation    TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Create the `lq_answers` table

```sql
CREATE TABLE lq_answers (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  lq_problem_id  INT          NOT NULL,
  is_correct     TINYINT(1)   NOT NULL,
  answered_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lq_problem_id) REFERENCES lq_problems(id)
);
```

### 6. Insert sample problems

```sql
-- Addition
INSERT INTO problems (operand1, operand2, operation, correct_answer, explanation)
VALUES ('45', '38', '+', '83', '45 + 38 = 83. Add units first: 5+8=13, carry 1. Then 4+3+1=8.');

-- Subtraction
INSERT INTO problems (operand1, operand2, operation, correct_answer, explanation)
VALUES ('92', '47', '-', '45', '92 - 47 = 45. Borrow from tens: 12-7=5, then 8-4=4.');

-- Multiplication
INSERT INTO problems (operand1, operand2, operation, correct_answer, explanation)
VALUES ('13', '6', '*', '78', '13 x 6 = 78. Multiply units: 3x6=18, carry 1. Then 1x6+1=7.');

-- Division (partial quotients) — 989 / 43
INSERT INTO problems (operand1, operand2, operation, correct_answer, explanation)
VALUES ('989', '43', '/', '23', '989 / 43 = 23 remainder 2. Use partial quotients: 10x43=430 twice, then 3x43=129.');

-- Division — 96 / 4
INSERT INTO problems (operand1, operand2, operation, correct_answer, explanation)
VALUES ('96', '4', '/', '24', '96 / 4 = 24. Try 20x4=80, then 4x4=16.');

-- Division — 157 / 6
INSERT INTO problems (operand1, operand2, operation, correct_answer, explanation)
VALUES ('157', '6', '/', '26', '157 / 6 = 26 remainder 1.');

-- Largest quotient — digits 2, 4, 6
INSERT INTO lq_problems (digit1, digit2, digit3, best_quotient, explanation)
VALUES (2, 4, 6, 12.0000, 'The largest quotient is 6 x 4 / 2 = 12. Put the largest numbers on top.');

-- Largest quotient — digits 3, 5, 1
INSERT INTO lq_problems (digit1, digit2, digit3, best_quotient, explanation)
VALUES (3, 5, 1, 15.0000, 'The largest quotient is 5 x 3 / 1 = 15. Dividing by the smallest number gives the largest result.');
```

---

## 🚀 Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install all dependencies

```bash
npm install
npm install express cors mysql2
```

### 3. Start WAMP
Make sure WAMP is running and MySQL is active (green icon in taskbar).

### 4. Start the backend

```bash
node server.js
```

You should see:
```
✅ Connected to MySQL
🚀 Server on port 5000
```

### 5. Start the frontend (open a second terminal)

```bash
npm start
```

App opens at **http://localhost:3000**

---

## 🌐 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Health check |
| POST | `/problem` | Create a standard problem |
| GET | `/problem/random` | Get a random standard problem |
| GET | `/problem/:id` | Get a standard problem by ID |
| POST | `/submit-answer` | Submit answer for standard problem |
| POST | `/lq-problem` | Create a largest quotient problem |
| GET | `/lq-problem/random` | Get a random LQ problem |
| POST | `/lq-submit` | Submit answer for LQ problem |
| GET | `/random-problem` | Get a random problem from either table |

---

## 🖥️ App Pages

| Route | Description |
|-------|-------------|
| `/` | Home — choose Admin or Student |
| `/admin` | Create problems |
| `/student` | Solve problems |

---

## 📝 Problem Types

### Standard Operations ( + − × ÷ )
Student sees the column layout and types their answer in the box.

### Division — Partial Quotients Method
Student fills in each partial quotient, running remainders, and the final quotient + remainder.
If wrong, the correct values are filled directly into the boxes automatically.

### Largest Quotient
Admin enters 3 digits. Student drags them into the boxes of `□ × □ ÷ □` to make the largest possible quotient.
The app computes the correct best arrangement automatically.

---

## 🗃️ Database Config

Edit the connection in `server.js` if needed:

```js
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",        // change if your MySQL has a password
  database: "column_op",
  port: 3306,
});
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react` | Frontend framework |
| `react-router-dom` | Page routing |
| `axios` | HTTP requests |
| `express` | Backend server |
| `cors` | Cross-origin requests |
| `mysql2` | MySQL connection |