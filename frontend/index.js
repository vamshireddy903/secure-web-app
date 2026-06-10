const express = require("express");
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Secure backend call (IAM protected)
 */
async function callBackend(path = "/tasks", method = "GET", body = null) {
  try {
    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(BACKEND_URL);

    const token = await client.idTokenProvider.fetchIdToken(BACKEND_URL);

    const res = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });

    return await res.json();
  } catch (err) {
    console.error("Backend call failed:", err.message);
    return [];
  }
}

/**
 * HOME PAGE (SAFE - NO BACKEND CALL HERE)
 */
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Secure Business App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>

  <body class="bg-light">

  <div class="container mt-5">

    <h2 class="text-center mb-4">🚀 Secure Business Task Manager</h2>

    <div class="card p-4 shadow">
      <h5>Add New Task</h5>
      <form action="/add" method="POST">
        <input class="form-control mb-2" name="title" placeholder="Enter task" required />
        <button class="btn btn-primary w-100">Add Task</button>
      </form>
    </div>

    <div class="text-center mt-3">
      <a href="/tasks" class="btn btn-success">View Tasks</a>
    </div>

  </div>

  </body>
  </html>
  `);
});

/**
 * VIEW TASKS (SAFE BACKEND CALL)
 */
app.get("/tasks", async (req, res) => {
  const tasks = await callBackend("/tasks");

  const list = tasks.map(t =>
    `<li class="list-group-item">${t.title}</li>`
  ).join("");

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Tasks</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>

  <body class="bg-light">

  <div class="container mt-5">

    <h2 class="text-center mb-4">📋 Task List</h2>

    <ul class="list-group mb-3">
      ${list || "<li class='list-group-item'>No tasks found</li>"}
    </ul>

    <a href="/" class="btn btn-primary">Back</a>

  </div>

  </body>
  </html>
  `);
});

/**
 * ADD TASK
 */
app.post("/add", async (req, res) => {
  try {
    await callBackend("/tasks", "POST", {
      title: req.body.title
    });
  } catch (err) {
    console.error("Add task failed:", err.message);
  }

  res.redirect("/tasks");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend running on port ${PORT}`);
});
