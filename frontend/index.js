const express = require("express");
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Call backend securely
 */
async function callBackend(path = "/data", method = "GET", body = null) {
  const auth = new GoogleAuth();

  const client = await auth.getIdTokenClient(BACKEND_URL);
  const idToken = await client.fetchIdToken(BACKEND_URL);

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return await response.text();
}

/**
 * Home route
 */
app.get("/", async (req, res) => {
  try {
    const data = await callBackend("/data");

    res.send(`
      <h1>Frontend Running Securely 🚀</h1>
      <pre>${data}</pre>
    `);
  } catch (err) {
    console.error(err);
    res.send("Error calling backend");
  }
});

/**
 * Add page
 */
app.get("/add", (req, res) => {
  res.send(`
    <form action="/submit" method="POST">
      <input name="name" placeholder="Enter name" required />
      <button type="submit">Send</button>
    </form>
  `);
});

/**
 * Submit data
 */
app.post("/submit", async (req, res) => {
  try {
    const result = await callBackend("/data", "POST", {
      name: req.body.name,
      source: "frontend"
    });

    res.send(`<pre>${result}</pre>`);
  } catch (err) {
    console.error(err);
    res.send("Error sending data");
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend running on port ${PORT}`);
});
