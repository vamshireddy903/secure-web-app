const express = require("express");
const { Firestore } = require("@google-cloud/firestore");

const app = express();
app.use(express.json());

const db = new Firestore();

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("Backend is running securely on Cloud Run");
});

/**
 * Save data to Firestore
 */
app.post("/data", async (req, res) => {
  try {
    const data = req.body;

    const docRef = await db.collection("app-data").add({
      ...data,
      timestamp: new Date()
    });

    res.json({
      message: "Data stored successfully",
      id: docRef.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error writing to Firestore");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
