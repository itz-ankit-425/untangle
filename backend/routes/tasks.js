import express from "express";
import { extractTasks, refineWithChat, analyzeProcrastination } from "../services/gemini.js";
import { db } from "../firebase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

// POST /api/tasks/extract
router.post("/extract", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });
    const tasks = await extractTasks(text);
    const savedTasks = [];
    for (const task of tasks) {
      const docRef = await db.collection("tasks").add({
        ...task,
        userId: req.userId,
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

// GET /api/tasks - only this user's tasks
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("tasks")
      .where("userId", "==", req.userId)
      .orderBy("createdAt", "desc")
      .get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id - verify ownership first
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("tasks").doc(id).get();
    if (!doc.exists || doc.data().userId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to edit this task" });
    }
    const updates = req.body;
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

// DELETE /api/tasks/:id - verify ownership first
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("tasks").doc(id).get();
    if (!doc.exists || doc.data().userId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to delete this task" });
    }
    const task = doc.data();
    if (task.status !== "done") {
      await db.collection("skipped_tasks").add({
        ...task,
        skippedAt: new Date().toISOString(),
        wasCompleted: false,
      });
    }
    await db.collection("tasks").doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/analyze - only this user's data
router.post("/analyze", async (req, res) => {
  try {
    const completedSnap = await db.collection("tasks")
      .where("userId", "==", req.userId)
      .where("wasCompleted", "==", true).get();
    const completed = completedSnap.docs.map(d => d.data());

    const skippedSnap = await db.collection("skipped_tasks")
      .where("userId", "==", req.userId).get();
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