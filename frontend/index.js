const express = require("express");
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Helper function to call backend securely using IAM token
 */
async function callBackend(path = "/data", method = "GET", body = null) {
  const auth = new GoogleAuth();

  // 🔐 Generate ID token for backend audience
  const client = await auth.getIdTokenClient(BACKEND_URL);
  const idToken = await client.idTokenProvider.fetchIdToken(BACKEND_URL);

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return await response.text();
}

/**
 * Home route - fetch backend data
 */
app.get("/", async (req, res) => {
  try {
    const data = await callBackend("/data");

    res.send(`
      <h1>Frontend Running Securely 🚀</h1>
      <pre>${data}</pre>
    `);
  } catch (err) {
    console.error("Error:", err.message);
    res.send("Error calling backend");
  }
});

/**
 * Simple form page
 */
app.get("/add", (req, res) => {
  res.send(`
    <h2>Add Data</h2>
    <form action="/submit" method="POST">
      <input name="name" placeholder="Enter name" required />
      <button type="submit">Send</button>
    </form>
  `);
});

/**
 * Send data to backend securely
 */
app.post("/submit", async (req, res) => {
  try {
    const result = await callBackend("/data", "POST", {
      name: req.body.name,
      source: "frontend"
    });

    res.send(`
      <h3>Data sent successfully ✅</h3>
      <pre>${result}</pre>
    `);
  } catch (err) {
    console.error("Submit error:", err.message);
    res.send("Error sending data");
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
