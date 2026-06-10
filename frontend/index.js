const express = require("express");
const axios = require("axios");

const app = express();

// Replace this after deploying backend Cloud Run URL
const BACKEND_URL = process.env.BACKEND_URL;

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/data`);

    res.send(`
      <h1>Secure GCP Application</h1>
      <h3>Backend Data:</h3>
      <pre>${JSON.stringify(response.data, null, 2)}</pre>
    `);
  } catch (error) {
    console.error(error.message);

    res.send(`
      <h1>Frontend Running</h1>
      <p>Backend not reachable or no data found</p>
    `);
  }
});

/**
 * Simple form to test POST request to backend
 */
app.get("/add", (req, res) => {
  res.send(`
    <h2>Add Data</h2>
    <form action="/submit" method="POST">
      <input name="name" placeholder="Enter name" />
      <button type="submit">Submit</button>
    </form>
  `);
});

app.post("/submit", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const name = req.body.name;

    await axios.post(`${BACKEND_URL}/data`, {
      name: name,
      source: "frontend"
    });

    res.send("<h3>Data sent to backend successfully</h3>");
  } catch (err) {
    res.send("<h3>Error sending data</h3>");
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
