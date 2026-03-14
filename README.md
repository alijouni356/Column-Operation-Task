# 🧮 Column Math System

A math practice app where admins create problems and students solve them.
Supports addition, subtraction, multiplication, division (partial quotients method), and largest quotient exercises.

---

## ⚙️ Prerequisites

Only **one thing** needs to be installed:

👉 [Download Node.js](https://nodejs.org/) — click the **LTS** button and install it like any normal program.

No WAMP. No MySQL. No database setup. The database is created automatically.

---

## 🚀 Running the Project

### Step 1 — Clone the repository

Open VS Code terminal with **Ctrl + `** and run:

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Start the backend

```bash
node server.js
```

You should see:
```
✅ SQLite database ready
🚀 Server on port 5000
```

> The file `database.db` is created automatically in the project folder — no SQL setup needed.

### Step 4 — Start the frontend

Click the **+** button in the terminal panel to open a second terminal, then run:

```bash
npm start
```

App opens at **http://localhost:3000** ✅

---

## 👤 How to Use

### Admin
1. Go to **http://localhost:3000**
2. Click **Admin**
3. Select the operation type ( + − × ÷ or Largest Quotient )
4. Fill in the numbers
5. Click **Save Problem**

### Student
1. Go to **http://localhost:3000**
2. Click **Student**
3. Solve the problem and click **Submit**
4. If wrong — the correct answer is shown for comparison
5. Click **Next** for a new problem

---

## 📝 Problem Types

### ➕ ➖ ✖️ Standard Operations
Student sees the numbers in column format and types their answer.

### ➗ Division — Partial Quotients Method
Student fills in each partial quotient step, running remainders, and the final quotient + remainder.
If wrong, both the student's attempt and the correct solution are shown side by side.
A **Try Again** button lets the student retry the same problem.

### 🏆 Largest Quotient
Admin enters 3 digits. Student drags them into `□ × □ ÷ □` to make the largest possible quotient.
The app automatically computes the correct best arrangement.

---

## 📁 Project Structure

```
project/
├── server.js                   ← Express backend (port 5000)
├── database.db                 ← SQLite database (auto-created on first run)
└── src/
    ├── App.jsx                 ← Router (Home / Admin / Student)
    ├── index.css               ← Global styles
    ├── api.js                  ← Backend URL config
    └── pages/
        ├── Admin.jsx           ← /admin — create problems
        ├── Student.jsx         ← /student — solve problems
        ├── PartialQuotient.jsx ← Division partial quotients UI
        └── LargestQuotient.jsx ← Largest quotient drag & drop UI
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
| `better-sqlite3` | SQLite database — no installation needed |

---

## ⚠️ Important Notes

- Keep **both terminals running** while using the app
- If you close a terminal the app will stop working
- To stop the app press **Ctrl + C** in both terminals
- The `database.db` file holds all your data — **back it up regularly**