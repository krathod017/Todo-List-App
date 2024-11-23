const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3003;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "todo_app",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// Create Table
const createTable = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0
  );
`;
db.query(createTable, (err) => {
  if (err) throw err;
  console.log("Tasks table ready");
});
app.use(express.static("public"));
// Routes
app.get("/", (req, res) => {
  db.query("SELECT * FROM tasks", (err, tasks) => {
    if (err) throw err;
    res.render("index", { tasks });
  });
});

app.post("/add", (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).send("Title is required");
  db.query(
    "INSERT INTO tasks (title, description) VALUES (?, ?)",
    [title, description],
    (err) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

app.post("/edit/:id", (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  db.query(
    "UPDATE tasks SET title = ?, description = ? WHERE id = ?",
    [title, description, id],
    (err) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

app.post("/delete/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM tasks WHERE id = ?", [id], (err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.post("/complete/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "UPDATE tasks SET completed = 1 WHERE id = ? AND completed = 0",
    [id],
    (err, results) => {
      if (err) throw err;
      if (results.affectedRows === 0) {
        return res.status(400).send("Task is already completed");
      }
      res.redirect("/");
    }
  );
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
