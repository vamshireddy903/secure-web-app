const express = require("express");
const { Firestore } = require("@google-cloud/firestore");

const app = express();
app.use(express.json());

// 🔐 Firestore initialization (uses Cloud Run service account)
const db = new Firestore();

/**
 * Health check (Cloud Run entry test)
 */
app.get("/", (req, res) => {
  res.send("Backend is running securely on Cloud Run 🚀");
});

/**
 * GET - Read all data from Firestore
 * Frontend calls: /data
 */
app.get("/data", async (req, res) => {
  try {
    const snapshot = await db.collection("app-data").get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      message: "Data fetched successfully",
      data: data
    });

  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({
      error: "Error reading Firestore"
    });
  }
});

/**
 * POST - Save data to Firestore
 * Frontend calls: /data
 */
app.post("/data", async (req, res) => {
  try {
    const input = req.body;

    const docRef = await db.collection("app-data").add({
      ...input,
      timestamp: new Date()
    });

    res.json({
      message: "Data stored successfully",
      id: docRef.id
    });

  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({
      error: "Error writing to Firestore"
    });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});


