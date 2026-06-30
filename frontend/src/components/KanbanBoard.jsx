import TaskCard from "./TaskCard";

const COLUMNS = [
  { id: "todo",       label: "To Do",       color: "#60a5fa", glow: "rgba(96,165,250,0.6)",   bg: "rgba(96,165,250,0.08)"  },
  { id: "inprogress", label: "In Progress", color: "#f59e0b", glow: "rgba(245,158,11,0.6)",   bg: "rgba(245,158,11,0.08)"  },
  { id: "done",       label: "Completed",   color: "#34d399", glow: "rgba(52,211,153,0.6)",   bg: "rgba(52,211,153,0.08)"  },
];

export default function KanbanBoard({ tasks, onStatusChange, onDelete, accessToken, onScheduled }) {
  const safe = Array.isArray(tasks) ? tasks : [];

  if (safe.length === 0) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px" }}>
      <div style={{
        width: "56px", height: "56px", borderRadius: "16px",
        background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))",
        border: "1px solid rgba(99,102,241,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
      }}>🧵</div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>No tasks yet</p>
        <p style={{ fontSize: "13px", color: "#1e293b" }}>Paste messy text in the chat panel to extract tasks</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", height: "100%", minHeight: 0 }}>
      {COLUMNS.map(col => {
        const colTasks = safe.filter(t => t.status === col.id);
        return (
          <div key={col.id} style={{
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.06)",
            backgroundColor: "rgba(255,255,255,0.02)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 14px", display: "flex", alignItems: "center", gap: "8px",
              borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0,
              backgroundColor: col.bg,
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: col.color, boxShadow: `0 0 8px ${col.glow}` }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: col.color, letterSpacing: "0.3px", textTransform: "uppercase" }}>{col.label}</span>
              <div style={{
                marginLeft: "auto", minWidth: "22px", height: "22px", borderRadius: "6px",
                backgroundColor: `${col.color}20`, border: `1px solid ${col.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700, color: col.color, padding: "0 6px",
              }}>{colTasks.length}</div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {colTasks.length === 0
                ? <div style={{ border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "10px", padding: "28px 16px", textAlign: "center", fontSize: "12px", color: "#1e293b" }}>No tasks here</div>
                : colTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    accessToken={accessToken}
                    onScheduled={onScheduled}
                  />
                ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}