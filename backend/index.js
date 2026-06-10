const express = require("express");
const { Firestore } = require("@google-cloud/firestore");

const app = express();
app.use(express.json());

const db = new Firestore();

// Health check
app.get("/", (req, res) => {
  res.send("Backend running securely 🚀");
});

// GET tasks
app.get("/tasks", async (req, res) => {
  const snapshot = await db.collection("tasks").get();

  const tasks = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  res.json(tasks);
});

// POST task
app.post("/tasks", async (req, res) => {
  const { title } = req.body;

  const doc = await db.collection("tasks").add({
    title,
    status: "pending",
    createdAt: new Date()
  });

  res.json({ id: doc.id, message: "Task created" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend running on", PORT);
});
