import { useState, useRef, useEffect } from "react";

export default function ChatPanel({ onExtract, onChat, loading }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", text: input }]);
    const cur = input;
    setInput("");
    if (isFirstMessage) {
      setIsFirstMessage(false);
      await onExtract(cur);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "✦ Done! Tasks extracted and organized by priority. Ask me to adjust anything.",
      }]);
    } else {
      await onChat(cur);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "✦ Board updated! Let me know if you need more changes.",
      }]);
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      backgroundColor: "#080c15", overflow: "hidden",
    }}>

      {/* ── HEADER ── */}
      <div style={{
        flexShrink: 0,
        background: "linear-gradient(180deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.05) 100%)",
        borderBottom: "1px solid rgba(99,102,241,0.25)",
        padding: "18px 20px 16px",
      }}>
        {/* Logo + badge row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "15px", flexShrink: 0,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "26px",
              boxShadow: "0 0 28px rgba(99,102,241,0.55), 0 0 0 1px rgba(99,102,241,0.3)",
            }}>✦</div>
            <div>
              <div style={{
                fontSize: "26px", fontWeight: 900, color: "#f1f5f9",
                letterSpacing: "-0.8px", lineHeight: 1.1,
              }}>
                AI Assistant
              </div>
              <div style={{ fontSize: "13px", color: "#818cf8", fontWeight: 600, marginTop: "3px" }}>
                Powered by Gemini
              </div>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
            fontSize: "11px", fontWeight: 800, color: "#34d399",
            backgroundColor: "rgba(52,211,153,0.12)",
            border: "1px solid rgba(52,211,153,0.3)",
            padding: "6px 14px", borderRadius: "999px", letterSpacing: "0.8px",
          }}>
            <div style={{
              width: "7px", height: "7px", borderRadius: "50%",
              backgroundColor: "#34d399", boxShadow: "0 0 8px #34d399",
              animation: "pulse 2s infinite",
            }} />
            ACTIVE
          </div>
        </div>

        {/* Status metrics */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { label: "Mode",   value: isFirstMessage ? "Extract" : "Refine", color: "#818cf8" },
            { label: "Model",  value: "Gemini",  color: "#f59e0b" },
            { label: "Status", value: "Ready",   color: "#34d399" },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, padding: "10px 8px", borderRadius: "10px", textAlign: "center",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px", fontWeight: 600, letterSpacing: "0.3px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Capabilities (only before first message) ── */}
      {isFirstMessage && messages.length === 0 && (
        <div style={{
          padding: "14px 20px", flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#334155", letterSpacing: "1px", marginBottom: "10px" }}>
            CAPABILITIES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { icon: "📋", label: "Extract tasks from any messy text" },
              { icon: "🎯", label: "Auto-assign HIGH / MED / LOW priority" },
              { icon: "👤", label: "Detect assignees & deadlines" },
              { icon: "✏️", label: "Refine tasks via natural language" },
            ].map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "9px",
                backgroundColor: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.12)",
              }}>
                <span style={{ fontSize: "14px" }}>{c.icon}</span>
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px 20px",
        display: "flex", flexDirection: "column", gap: "14px",
        minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", fontSize: "12px", color: "#1e293b" }}>
            Paste your text below to get started ↓
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", gap: "10px", animation: "fadeIn 0.3s ease",
            flexDirection: msg.role === "user" ? "row-reverse" : "row",
            alignItems: "flex-start",
          }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "9px", flexShrink: 0,
              background: msg.role === "assistant"
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "rgba(255,255,255,0.08)",
              border: msg.role === "user" ? "1px solid rgba(255,255,255,0.12)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", color: "#fff",
              boxShadow: msg.role === "assistant" ? "0 4px 14px rgba(99,102,241,0.35)" : "none",
            }}>
              {msg.role === "assistant" ? "✦" : "👤"}
            </div>
            <div style={{
              maxWidth: "80%", padding: "11px 14px", fontSize: "13px", lineHeight: 1.65,
              borderRadius: msg.role === "user" ? "14px 3px 14px 14px" : "3px 14px 14px 14px",
              backgroundColor: msg.role === "user" ? "#6366f1" : "rgba(255,255,255,0.05)",
              border: msg.role === "user" ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
              color: msg.role === "user" ? "#fff" : "#94a3b8",
              boxShadow: msg.role === "user" ? "0 4px 20px rgba(99,102,241,0.25)" : "none",
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "9px", flexShrink: 0,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", color: "#fff",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}>✦</div>
            <div style={{
              padding: "13px 18px", borderRadius: "3px 14px 14px 14px",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", gap: "5px", alignItems: "center",
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#6366f1",
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: "14px 18px 18px", flexShrink: 0,
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{
          borderRadius: "14px", overflow: "hidden",
          border: "1px solid rgba(99,102,241,0.35)",
          background: "rgba(99,102,241,0.06)",
          boxShadow: "0 0 30px rgba(99,102,241,0.1)",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            disabled={loading}
            placeholder={isFirstMessage
              ? "Paste your WhatsApp chat, email, or messy notes here..."
              : "Ask me to refine, reprioritize, or add tasks..."}
            rows={4}
            style={{
              width: "100%", background: "none", border: "none", outline: "none",
              color: "#e2e8f0", fontSize: "13px", lineHeight: 1.65,
              padding: "14px 16px 10px", resize: "none", fontFamily: "inherit",
            }}
          />
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 12px 12px",
          }}>
            <span style={{ fontSize: "11px", color: "#1e293b" }}>⏎ Send · ⇧⏎ New line</span>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                padding: "8px 22px", borderRadius: "10px", border: "none",
                fontSize: "13px", fontWeight: 700,
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "rgba(255,255,255,0.06)",
                color: input.trim() && !loading ? "#fff" : "#334155",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                boxShadow: input.trim() && !loading ? "0 4px 20px rgba(99,102,241,0.4)" : "none",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Processing..." : "Send ↑"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}