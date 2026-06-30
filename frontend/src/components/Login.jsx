import { loginWithGoogle } from "../firebase.js";

export default function Login() {
  async function handleLogin() {
    try {
      await loginWithGoogle();
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  }

  return (
    <div style={{
      height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "#070b14",
      backgroundImage: "radial-gradient(ellipse at 15% 0%, rgba(99,102,241,0.1) 0%, transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(124,58,237,0.08) 0%, transparent 55%)",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{
        padding: "40px", borderRadius: "20px", textAlign: "center",
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(99,102,241,0.2)",
        boxShadow: "0 0 60px rgba(99,102,241,0.1)",
        maxWidth: "380px",
      }}>
        <div style={{
          width: "60px", height: "60px", borderRadius: "16px", margin: "0 auto 20px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px", boxShadow: "0 0 32px rgba(99,102,241,0.5)",
        }}>🧵</div>
        <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.6px", marginBottom: "8px" }}>
          Untangle
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "28px", lineHeight: 1.6 }}>
          Turn chaos into clarity. Sign in to manage your personal task board.
        </p>
        <button onClick={handleLogin} style={{
          width: "100%", padding: "12px", borderRadius: "12px", border: "none",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer",
          boxShadow: "0 0 24px rgba(99,102,241,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
        }}>
          <span style={{ fontSize: "16px" }}>G</span> Sign in with Google
        </button>
      </div>
    </div>
  );
}