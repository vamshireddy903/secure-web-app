const express = require("express");
const { GoogleAuth } = require("google-auth-library");

const app = express();

const BACKEND_URL = process.env.BACKEND_URL;

app.get("/", async (req, res) => {
  try {
    const auth = new GoogleAuth();

    // 🔐 Generate IAM identity token for backend
    const client = await auth.getIdTokenClient(BACKEND_URL);

    // 🔁 Call backend securely
    const response = await client.request({
      url: `${BACKEND_URL}/data`
    });

    res.send(`
      <h1>Frontend Running Securely</h1>
      <pre>${JSON.stringify(response.data, null, 2)}</pre>
    `);

  } catch (error) {
    console.error(error);
    res.send("Error calling backend");
  }
});

/**
 * Simple form to send data to backend
 */
app.get("/add", (req, res) => {
  res.send(`
    <form action="/submit" method="POST">
      <input name="name" placeholder="Enter name" />
      <button type="submit">Send</button>
    </form>
  `);
});

app.post("/submit", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(BACKEND_URL);

    await client.request({
      url: `${BACKEND_URL}/data`,
      method: "POST",
      data: {
        name: req.body.name,
        source: "frontend"
      }
    });

    res.send("Data sent securely to backend");
  } catch (err) {
    console.error(err);
    res.send("Error sending data");
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
