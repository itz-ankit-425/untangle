import { useState, useEffect } from "react";
import ChatPanel from "./components/ChatPanel";
import KanbanBoard from "./components/KanbanBoard";
import ProfilePanel from "./components/ProfilePanel";
import NotificationBell from "./components/NotificationBell";

const API = "https://untangle-backend-c21j.onrender.com/api/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarToken, setCalendarToken] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(d => { setTasks(d.tasks || []); setLoadingTasks(false); })
      .catch(() => setLoadingTasks(false));
  }, []);

  async function handleExtract(text) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/extract`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.tasks && Array.isArray(data.tasks)) setTasks(prev => [...data.tasks, ...prev]);
      else alert("Error: " + (data.error || "Unknown"));
    } catch (e) { alert(e.message); }
    setLoading(false);
  }

  async function handleChat(message) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, currentTasks: tasks }),
      });
      const data = await res.json();
      if (data.tasks && Array.isArray(data.tasks)) setTasks(data.tasks);
    } catch (e) { alert(e.message); }
    setLoading(false);
  }

  async function handleStatusChange(taskId, newStatus) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await fetch(`${API}/${taskId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function handleDelete(taskId) {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await fetch(`${API}/${taskId}`, { method: "DELETE" });
  }

  async function handleClearAll() {
    if (!confirm("Clear all tasks?")) return;
    for (const t of tasks) await fetch(`${API}/${t.id}`, { method: "DELETE" });
    setTasks([]);
  }

  function handleScheduled(taskId, scheduledTime) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, scheduledTime } : t));
  }

  const counts = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inprogress: tasks.filter(t => t.status === "inprogress").length,
    done: tasks.filter(t => t.status === "done").length,
    high: tasks.filter(t => t.priority === "high").length,
  };

  const stats = [
    { label: "Total Tasks",   value: counts.total,      icon: "⬡", color: "#818cf8", glow: "rgba(129,140,248,0.15)", border: "rgba(129,140,248,0.2)" },
    { label: "To Do",         value: counts.todo,       icon: "◫", color: "#60a5fa", glow: "rgba(96,165,250,0.15)",  border: "rgba(96,165,250,0.2)"  },
    { label: "In Progress",   value: counts.inprogress, icon: "◈", color: "#f59e0b", glow: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.2)"  },
    { label: "Completed",     value: counts.done,       icon: "◉", color: "#34d399", glow: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.2)"  },
    { label: "High Priority", value: counts.high,       icon: "◆", color: "#f87171", glow: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.2)" },
  ];

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden",
      backgroundColor: "#070b14",
      backgroundImage: "radial-gradient(ellipse at 15% 0%, rgba(99,102,241,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(124,58,237,0.05) 0%, transparent 55%)",
      color: "#e2e8f0", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{opacity:0.3} 50%{opacity:0.7} 100%{opacity:0.3} }
        @keyframes cardIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Top Nav ── */}
      <nav style={{
        height: "48px", flexShrink: 0, display: "flex", alignItems: "center",
        padding: "0 20px", gap: "12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backgroundColor: "rgba(7,11,20,0.95)", backdropFilter: "blur(16px)",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", boxShadow: "0 0 16px rgba(99,102,241,0.4)",
          }}>🧵</div>
          <span style={{ fontWeight: 900, fontSize: "22px", letterSpacing: "-0.6px", color: "#f1f5f9" }}>Untangle</span>
          <span style={{
            fontSize: "10px", fontWeight: 700, color: "#6366f1",
            backgroundColor: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
            padding: "2px 8px", borderRadius: "999px", letterSpacing: "0.5px",
          }}>AI</span>
        </div>

        <div style={{ flex: 1 }} />

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ display: "flex", gap: "3px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#8b5cf6",
                  animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: 600 }}>AI Processing</span>
          </div>
        )}

        <NotificationBell tasks={tasks} />

        <button onClick={() => setShowProfile(true)} style={{
          fontSize: "11px", fontWeight: 600, padding: "5px 14px", borderRadius: "7px",
          backgroundColor: "rgba(99,102,241,0.1)", color: "#818cf8",
          border: "1px solid rgba(99,102,241,0.2)", cursor: "pointer", transition: "all 0.2s",
        }}>🧠 My Profile</button>

        {tasks.length > 0 && (
          <button onClick={handleClearAll} style={{
            fontSize: "11px", fontWeight: 600, padding: "5px 14px", borderRadius: "7px",
            backgroundColor: "rgba(239,68,68,0.08)", color: "#f87171",
            border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", transition: "all 0.2s",
          }}>Clear All</button>
        )}
      </nav>

      {/* ── Stat Cards ── */}
      <div style={{
        display: "flex", gap: "10px", padding: "8px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
        backgroundColor: "rgba(7,11,20,0.7)",
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            flex: 1, padding: "8px 12px", borderRadius: "10px",
            backgroundColor: s.glow, border: `1px solid ${s.border}`,
            display: "flex", alignItems: "center", gap: "10px",
            animation: "slideDown 0.4s ease",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              backgroundColor: `${s.color}18`, border: `1px solid ${s.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", color: s.color, flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: s.color, lineHeight: 1.1, letterSpacing: "-0.3px" }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 500, marginTop: "1px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Chat Sidebar */}
        <div style={{
          width: "400px", flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(5,8,18,0.95)",
          display: "flex", flexDirection: "column",
          overflow: "hidden", minHeight: 0,
        }}>
          <ChatPanel onExtract={handleExtract} onChat={handleChat} loading={loading} />
        </div>

        {/* Kanban Board */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {loadingTasks
            ? <LoadingSkeleton />
            : <KanbanBoard
                tasks={tasks}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                accessToken={calendarToken}
                onScheduled={handleScheduled}
              />
          }
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", height: "100%" }}>
      {[0,1,2].map(col => (
        <div key={col} style={{
          borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(255,255,255,0.02)", padding: "14px",
          display: "flex", flexDirection: "column", gap: "10px",
        }}>
          <div style={{ height: "16px", width: "80px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", animation: "shimmer 1.5s infinite" }} />
          {[0,1,2].map(card => (
            <div key={card} style={{
              borderRadius: "10px", padding: "14px",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", flexDirection: "column", gap: "8px",
              animationDelay: `${card * 0.1}s`,
            }}>
              <div style={{ height: "10px", width: "50px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "shimmer 1.5s infinite" }} />
              <div style={{ height: "14px", width: "100%", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "shimmer 1.5s infinite" }} />
              <div style={{ height: "12px", width: "70%", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "shimmer 1.5s infinite" }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}