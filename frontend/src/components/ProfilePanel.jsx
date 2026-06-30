import { useState } from "react";

const API = "http://localhost:5000/api/tasks";

export default function ProfilePanel({ onClose, authHeader }) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  async function generateProfile() {
    setLoading(true);
    setError(null);
    try {
      const headers = authHeader ? await authHeader() : {};
      const res = await fetch(`${API}/analyze`, { method: "POST", headers });
      const data = await res.json();
      if (typeof data.analysis === "string") {
        setError(data.analysis);
      } else {
        setProfile(data.analysis);
      }
    } catch (e) {
      setError("Failed to generate profile: " + e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "560px", maxHeight: "85vh",
        backgroundColor: "#0d1117", borderRadius: "20px",
        border: "1px solid rgba(99,102,241,0.3)",
        boxShadow: "0 0 60px rgba(99,102,241,0.15)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))",
        }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.4px" }}>
              🧠 Procrastination Profile
            </h2>
            <p style={{ fontSize: "12px", color: "#6366f1", marginTop: "3px", fontWeight: 500 }}>
              AI-powered behavioral analysis
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8", fontSize: "18px", width: "32px", height: "32px",
            borderRadius: "8px", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {!profile && !error && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6, marginBottom: "24px" }}>
                Untangle AI will analyze your task completion patterns and generate a personal productivity profile with actionable insights.
              </p>
              <button
                onClick={generateProfile}
                disabled={loading}
                style={{
                  padding: "12px 32px", borderRadius: "12px", border: "none",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", fontSize: "14px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 0 24px rgba(99,102,241,0.4)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Analyzing patterns..." : "✦ Generate My Profile"}
              </button>
            </div>
          )}

          {error && (
            <div style={{
              padding: "16px", borderRadius: "12px",
              backgroundColor: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              textAlign: "center",
            }}>
              <p style={{ fontSize: "14px", color: "#818cf8", lineHeight: 1.6 }}>{error}</p>
              <p style={{ fontSize: "12px", color: "#334155", marginTop: "8px" }}>
                Complete or skip more tasks to build up data!
              </p>
            </div>
          )}

          {profile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Score + Title */}
              <div style={{
                padding: "20px", borderRadius: "14px",
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))",
                border: "1px solid rgba(99,102,241,0.2)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "48px", fontWeight: 900, color: "#818cf8", letterSpacing: "-2px" }}>
                  {profile.score}
                </div>
                <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600, letterSpacing: "1px", marginBottom: "8px" }}>
                  PRODUCTIVITY SCORE
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>{profile.title}</div>
                <div style={{
                  marginTop: "12px", padding: "4px 16px", borderRadius: "999px", display: "inline-block",
                  backgroundColor: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)",
                  fontSize: "12px", color: "#34d399", fontWeight: 600,
                }}>
                  {profile.completionRate}% completion rate
                </div>
              </div>

              {/* Summary */}
              <div style={{
                padding: "16px", borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#334155", letterSpacing: "0.8px", marginBottom: "8px" }}>SUMMARY</div>
                <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>{profile.summary}</p>
              </div>

              {/* Patterns */}
              <Section title="📊 Patterns Detected" items={profile.patterns} color="#818cf8" />

              {/* Weak spots */}
              <Section title="⚠️ Weak Spots" items={profile.weakSpots} color="#f87171" />

              {/* Recommendations */}
              <Section title="💡 Recommendations" items={profile.recommendations} color="#34d399" />

              {/* Regenerate */}
              <button onClick={generateProfile} disabled={loading} style={{
                padding: "10px", borderRadius: "10px", border: "1px solid rgba(99,102,241,0.2)",
                background: "rgba(99,102,241,0.08)", color: "#818cf8",
                fontSize: "12px", fontWeight: 600, cursor: "pointer",
              }}>
                ↻ Regenerate Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, color }) {
  return (
    <div style={{
      padding: "16px", borderRadius: "12px",
      backgroundColor: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#334155", letterSpacing: "0.8px", marginBottom: "10px" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {items?.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              backgroundColor: color, marginTop: "5px", flexShrink: 0,
              boxShadow: `0 0 6px ${color}`,
            }} />
            <p style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.55 }}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}