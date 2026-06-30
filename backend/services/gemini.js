import dotenv from "dotenv";
dotenv.config();

const MODELS = [
  `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
];

async function callGemini(prompt) {
  for (const url of MODELS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      const data = await res.json();
      console.log("Gemini raw response:", JSON.stringify(data).substring(0, 200));
      if (res.ok) return data.candidates[0].content.parts[0].text;
      console.log(`Model failed (${data.error?.code}), trying next...`);
    } catch (e) {
      console.log("Model error, trying next:", e.message);
    }
  }
  throw new Error("All Gemini models unavailable. Please try again in a moment.");
}

export async function extractTasks(text) {
  const prompt = `You are a task extraction assistant. Analyze the following messy text and extract all actionable tasks.

Return ONLY a valid JSON array. No explanation, no markdown, just the JSON.

Each task must have:
- "title": short task name (max 8 words)
- "description": more detail about the task
- "priority": exactly one of "high", "medium", or "low"
- "status": always set to "todo"
- "assignee": person responsible if mentioned, otherwise "Unassigned"

Text to analyze:
"""
${text}
"""

Return format:
[{"title":"...","description":"...","priority":"high","status":"todo","assignee":"..."}]`;

  const raw = await callGemini(prompt);
  const cleaned = raw.replace(/\`\`\`json|\`\`\`/g, "").trim();
  return JSON.parse(cleaned);
}

export async function refineWithChat(userMessage, currentTasks) {
  const prompt = `You are a task management assistant. The user has these current tasks:
${JSON.stringify(currentTasks, null, 2)}

The user says: "${userMessage}"

Update the tasks based on what the user said. Return ONLY the updated JSON array. No explanation.`;

  const raw = await callGemini(prompt);
  const cleaned = raw.replace(/\`\`\`json|\`\`\`/g, "").trim();
  return JSON.parse(cleaned);
}

export async function analyzeProcrastination(completed, skipped) {
  const prompt = `You are a productivity coach and behavioral analyst. Analyze this person's task completion patterns.

COMPLETED TASKS (${completed.length}):
${JSON.stringify(completed.map(t => ({
  title: t.title,
  priority: t.priority,
  assignee: t.assignee,
  createdAt: t.createdAt,
  completedAt: t.completedAt,
})), null, 2)}

SKIPPED/DELETED TASKS (${skipped.length}):
${JSON.stringify(skipped.map(t => ({
  title: t.title,
  priority: t.priority,
  assignee: t.assignee,
  createdAt: t.createdAt,
  skippedAt: t.skippedAt,
})), null, 2)}

Generate a personal procrastination profile. Be specific, insightful, and actionable.

Return a JSON object with this exact structure:
{
  "score": <number 0-100, higher = better productivity>,
  "title": "<a fun title for their productivity style e.g. 'The Last-Minute Hero'>",
  "summary": "<2-3 sentence overview of their patterns>",
  "patterns": [
    "<specific pattern observed>",
    "<specific pattern observed>",
    "<specific pattern observed>"
  ],
  "weakSpots": [
    "<specific weakness>",
    "<specific weakness>"
  ],
  "recommendations": [
    "<actionable recommendation>",
    "<actionable recommendation>",
    "<actionable recommendation>"
  ],
  "completionRate": <number 0-100>
}

Return ONLY the JSON. No markdown, no explanation.`;

  const raw = await callGemini(prompt);
  const cleaned = raw.replace(/\`\`\`json|\`\`\`/g, "").trim();
  return JSON.parse(cleaned);
}