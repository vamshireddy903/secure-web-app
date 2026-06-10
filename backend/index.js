const express = require("express");
const { Firestore } = require("@google-cloud/firestore");

const app = express();
app.use(express.json());

// Firestore automatically uses Cloud Run service account (IMPORTANT)
const db = new Firestore();

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.status(200).send("Backend is running on Cloud Run");
});

/**
 * Save data to Firestore
 */
app.post("/data", async (req, res) => {
  try {
    const payload = req.body;

    const docRef = await db.collection("app-data").add({
      ...payload,
      timestamp: new Date()
    });

    res.status(200).json({
      message: "Data stored successfully",
      id: docRef.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error storing data");
  }
});

/**
 * Get data from Firestore
 */
app.get("/data", async (req, res) => {
  try {
    const snapshot = await db.collection("app-data").get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
