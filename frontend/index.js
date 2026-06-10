const express = require("express");
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const BACKEND_URL = process.env.BACKEND_URL;

// Secure backend call (IAM)
async function callBackend(path, method = "GET", body = null) {
  const auth = new GoogleAuth();
  const client = await auth.getIdTokenClient(BACKEND_URL);
  const token = await client.fetchIdToken(BACKEND_URL);

  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return res.json();
}

// UI
app.get("/", async (req, res) => {
  const tasks = await callBackend("/tasks");

  const list = tasks.map(t =>
    `<li class="list-group-item">${t.title}</li>`
  ).join("");

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Secure Task App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  </head>

  <body class="bg-light">

  <div class="container mt-5">

    <h2 class="text-center mb-4">🚀 Secure Business App</h2>

    <div class="card p-3 mb-3">
      <form action="/add" method="POST">
        <input class="form-control mb-2" name="title" placeholder="Enter task" required />
        <button class="btn btn-primary w-100">Add Task</button>
      </form>
    </div>

    <div class="card p-3">
      <h5>Tasks</h5>
      <ul class="list-group">
        ${list}
      </ul>
    </div>

  </div>

  </body>
  </html>
  `);
});

// Add task
app.post("/add", async (req, res) => {
  await callBackend("/tasks", "POST", {
    title: req.body.title
  });

  res.redirect("/");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Frontend running on", PORT);
});
