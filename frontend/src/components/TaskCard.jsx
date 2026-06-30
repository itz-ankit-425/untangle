import { useState } from "react";
import { pushTaskToCalendar, signInWithGoogle } from "../services/calendar.js";

const P = {
  high:   { label: "HIGH", color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)", glow: "rgba(248,113,113,0.15)" },
  medium: { label: "MED",  color: "#fb923c", bg: "rgba(251,146,60,0.1)",   border: "rgba(251,146,60,0.25)",  glow: "rgba(251,146,60,0.15)"  },
  low:    { label: "LOW",  color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.25)",  glow: "rgba(52,211,153,0.15)"  },
};

export default function TaskCard({ task, onStatusChange, onDelete, accessToken, onScheduled }) {
  const [hovered, setHovered] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [calDone, setCalDone] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const p = P[task.priority] || P.medium;

  async function handlePushToCalendar() {
    setCalLoading(true);
    try {
      let token = accessToken;
      if (!token) token = await signInWithGoogle();
      const result = await pushTaskToCalendar(token, task);
      setCalDone(true);
      if (onScheduled) onScheduled(task.id, result.scheduledTime);
    } catch (err) {
      alert("Calendar error: " + err.message);
    }
    setCalLoading(false);
  }

  function handleDelete() {
    setDeleting(true);
    setTimeout(() => onDelete(task.id), 300);
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "13px", borderRadius: "12px",
        backgroundColor: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? p.border : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${p.border}` : "none",
        display: "flex", flexDirection: "column", gap: "8px",
        opacity: deleting ? 0 : 1,
        transform: deleting ? "scale(0.95) translateY(-4px)" : "scale(1)",
        animation: "cardIn 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: "9px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px",
          backgroundColor: p.bg, color: p.color, border: `1px solid ${p.border}`,
          letterSpacing: "0.8px", boxShadow: hovered ? `0 0 8px ${p.glow}` : "none",
          transition: "box-shadow 0.2s",
        }}>{p.label}</span>
        <button onClick={handleDelete} style={{
          background: "none", border: "none", fontSize: "16px", lineHeight: 1,
          color: hovered ? "#ef4444" : "transparent", cursor: "pointer",
          padding: "0 2px", transition: "all 0.15s", transform: hovered ? "scale(1)" : "scale(0.8)",
        }}>×</button>
      </div>

      {/* Title */}
      <p style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>{task.title}</p>

      {/* Desc */}
      {task.description && (
        <p style={{ fontSize: "11.5px", color: "#475569", lineHeight: 1.5 }}>{task.description}</p>
      )}

      {/* Footer */}
      <div style={{
        paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column", gap: "7px",
      }}>
        {task.assignee && task.assignee !== "Unassigned"
          ? <span style={{ fontSize: "11px", color: "#475569", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "10px" }}>👤</span> {task.assignee}
            </span>
          : <span style={{ fontSize: "11px", color: "#1e293b" }}>Unassigned</span>
        }

        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {task.status !== "todo"       && <Btn label="← Todo"     onClick={() => onStatusChange(task.id, "todo")} />}
          {task.status !== "inprogress" && <Btn label="⚡ Progress" onClick={() => onStatusChange(task.id, "inprogress")} />}
          {task.status !== "done"       && <Btn label="✓ Done"     onClick={() => onStatusChange(task.id, "done")} color="#34d399" />}
        </div>

        <button
          onClick={handlePushToCalendar}
          disabled={calLoading || calDone}
          style={{
            width: "100%", padding: "7px", borderRadius: "8px", border: "none",
            fontSize: "11px", fontWeight: 600,
            cursor: calDone ? "default" : "pointer",
            background: calDone
              ? "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.08))"
              : hovered
                ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))"
                : "rgba(99,102,241,0.08)",
            color: calDone ? "#34d399" : "#818cf8",
            border: calDone
              ? "1px solid rgba(52,211,153,0.25)"
              : "1px solid rgba(99,102,241,0.2)",
            transition: "all 0.2s",
            boxShadow: calDone ? "0 0 12px rgba(52,211,153,0.1)" : "none",
          }}
        >
          {calDone ? "✓ Added to Calendar" : calLoading ? "Adding..." : "📅 Push to Calendar"}
        </button>
      </div>
    </div>
  );
}

function Btn({ label, onClick, color }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      fontSize: "10px", fontWeight: 600, padding: "3px 9px", borderRadius: "6px",
      backgroundColor: h ? (color ? `${color}20` : "rgba(99,102,241,0.15)") : "rgba(255,255,255,0.04)",
      color: h ? (color || "#818cf8") : "#334155",
      border: `1px solid ${h ? (color ? `${color}40` : "rgba(99,102,241,0.3)") : "rgba(255,255,255,0.07)"}`,
      cursor: "pointer", transition: "all 0.15s",
    }}>{label}</button>
  );
}