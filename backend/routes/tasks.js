import express from "express";
import { extractTasks, refineWithChat, analyzeProcrastination } from "../services/gemini.js";
import { db } from "../firebase.js";

const router = express.Router();

// POST /api/tasks/extract
router.post("/extract", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });
    console.log("Extracting tasks from text:", text.substring(0, 50) + "...");
    const tasks = await extractTasks(text);
    console.log("Tasks extracted:", tasks.length);
    const savedTasks = [];
    for (const task of tasks) {
      const docRef = await db.collection("tasks").add({
        ...task,
        createdAt: new Date().toISOString(),
      });
      savedTasks.push({ id: docRef.id, ...task });
    }
    res.json({ tasks: savedTasks });
  } catch (err) {
    console.error("❌ Extract error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, currentTasks } = req.body;
    const updatedTasks = await refineWithChat(message, currentTasks);
    res.json({ tasks: updatedTasks });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("tasks").orderBy("createdAt", "desc").get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If marking as done, log completion
    if (updates.status === "done") {
      updates.completedAt = new Date().toISOString();
      updates.wasCompleted = true;
    }

    await db.collection("tasks").doc(id).update(updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Log as skipped before deleting
    const doc = await db.collection("tasks").doc(id).get();
    if (doc.exists) {
      const task = doc.data();
      if (task.status !== "done") {
        await db.collection("skipped_tasks").add({
          ...task,
          skippedAt: new Date().toISOString(),
          wasCompleted: false,
        });
      }
    }

    await db.collection("tasks").doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/analyze - generate procrastination profile
router.post("/analyze", async (req, res) => {
  try {
    // Get completed tasks
    const completedSnap = await db.collection("tasks")
      .where("wasCompleted", "==", true).get();
    const completed = completedSnap.docs.map(d => d.data());

    // Get skipped tasks
    const skippedSnap = await db.collection("skipped_tasks").get();
    const skipped = skippedSnap.docs.map(d => d.data());

    if (completed.length + skipped.length < 3) {
      return res.json({
        analysis: "Not enough data yet. Complete or skip at least 3 tasks to generate your procrastination profile!"
      });
    }

    const analysis = await analyzeProcrastination(completed, skipped);
    res.json({ analysis });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;