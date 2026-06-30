import { useState, useEffect } from "react";

export default function NotificationBell({ tasks }) {
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  // Compute overdue / due-soon tasks
  const now = new Date();
  const alerts = tasks
    .filter(t => t.scheduledTime && t.status !== "done")
    .map(t => {
      const due = new Date(t.scheduledTime);
      const diffHours = (due - now) / (1000 * 60 * 60);
      let urgency = null;
      if (diffHours < 0) urgency = "overdue";
      else if (diffHours < 24) urgency = "soon";
      return { ...t, due, diffHours, urgency };
    })
    .filter(t => t.urgency)
    .sort((a, b) => a.diffHours - b.diffHours);

  // Request browser notification permission
  function requestPermission() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then(setPermission);
  }

  // Fire browser notifications for overdue tasks (once per session)
  useEffect(() => {
    if (permission !== "granted") return;
    const overdue = alerts.filter(a => a.urgency === "overdue");
    overdue.forEach(t => {
      const key = `notified-${t.id}`;
      if (!sessionStorage.getItem(key)) {
        new Notification("⏰ Overdue Task", {
          body: t.title,
          icon: "🧵",
        });
        sessionStorage.setItem(key, "1");
      }
    });
  }, [alerts.length, permission]);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "relative", width: "32px", height: "32px", borderRadius: "8px",
          background: open ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "15px", cursor: "pointer", transition: "all 0.2s",
        }}
      >
        🔔
        {alerts.length > 0 && (
          <span style={{
            position: "absolute", top: "-4px", right: "-4px",
            width: "16px", height: "16px", borderRadius: "50%",
            backgroundColor: "#ef4444", color: "#fff",
            fontSize: "9px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 8px rgba(239,68,68,0.6)",
          }}>{alerts.length}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "40px", right: 0, width: "320px",
          backgroundColor: "#0d1117", borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          zIndex: 50, overflow: "hidden", animation: "slideDown 0.2s ease",
        }}>
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9" }}>Notifications</span>
            {permission !== "granted" && typeof Notification !== "undefined" && (
              <button onClick={requestPermission} style={{
                fontSize: "10px", color: "#818cf8", background: "none",
                border: "none", cursor: "pointer", fontWeight: 600,
              }}>Enable alerts</button>
            )}
          </div>

          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {alerts.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>✨</div>
                <p style={{ fontSize: "12px", color: "#475569" }}>No overdue or upcoming tasks</p>
              </div>
            ) : (
              alerts.map(t => (
                <div key={t.id} style={{
                  padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                  display: "flex", gap: "10px", alignItems: "flex-start",
                }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%", marginTop: "5px", flexShrink: 0,
                    backgroundColor: t.urgency === "overdue" ? "#f87171" : "#fb923c",
                    boxShadow: t.urgency === "overdue" ? "0 0 6px #f87171" : "0 0 6px #fb923c",
                  }} />
                  <div>
                    <p style={{ fontSize: "12.5px", fontWeight: 600, color: "#e2e8f0", marginBottom: "3px" }}>{t.title}</p>
                    <p style={{
                      fontSize: "11px", fontWeight: 600,
                      color: t.urgency === "overdue" ? "#f87171" : "#fb923c",
                    }}>
                      {t.urgency === "overdue"
                        ? `Overdue by ${Math.abs(Math.round(t.diffHours))}h`
                        : `Due in ${Math.round(t.diffHours)}h`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}