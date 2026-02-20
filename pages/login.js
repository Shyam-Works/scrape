import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const AUTH_USERNAME = "admin";
    const AUTH_PASSWORD = "admin123";

    setTimeout(() => {
      if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
        localStorage.setItem("isAuthenticated", "true");
        router.push("/drafts");
      } else {
        setError("Invalid username or password");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div style={s.root}>
      <Head>
        <title>Login · Scrap Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={s.topDecor} />

      <div style={s.card}>
        <div style={s.iconWrap}>
          <span style={s.icon}>🏭</span>
        </div>
        <h1 style={s.title}>Scrap Tracker</h1>
        <p style={s.subtitle}>Admin Access</p>

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.fieldWrap}>
            <span style={s.fieldIcon}>👤</span>
            <input
              style={s.input}
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </div>

          <div style={s.fieldWrap}>
            <span style={s.fieldIcon}>🔒</span>
            <input
              style={s.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={s.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" style={s.loginBtn} disabled={loading}>
            {loading ? <span style={s.spinner}>⟳</span> : "Login to Dashboard"}
          </button>
        </form>

        <div style={s.dividerRow}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or</span>
          <div style={s.dividerLine} />
        </div>

        <button onClick={() => router.push("/")} style={s.newReportBtn}>
          + Create New Report
        </button>
      </div>

      <p style={s.footer}>Scrap Material Tracker · Internal Use Only</p>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#f0f2f7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20, boxSizing: "border-box" },
  topDecor: { position: "fixed", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, #033f85, #1a6bd4, #033f85)", zIndex: 10 },
  card: { background: "#fff", borderRadius: 24, padding: "36px 28px 28px", width: "100%", maxWidth: 380, boxShadow: "0 8px 40px rgba(3,63,133,0.12)", boxSizing: "border-box" },
  iconWrap: { width: 64, height: 64, background: "#033f85", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  icon: { fontSize: 30 },
  title: { textAlign: "center", fontSize: 22, fontWeight: 700, color: "#111", margin: "0 0 4px" },
  subtitle: { textAlign: "center", fontSize: 13, color: "#888", margin: "0 0 28px", fontWeight: 500 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  fieldWrap: { display: "flex", alignItems: "center", border: "1.5px solid #e0e3ed", borderRadius: 14, padding: "0 14px", background: "#fafbfd", gap: 10 },
  fieldIcon: { fontSize: 16, flexShrink: 0 },
  input: { flex: 1, border: "none", outline: "none", padding: "14px 0", fontSize: 15, fontFamily: "inherit", background: "transparent", color: "#111" },
  errorBox: { background: "#fff0f0", border: "1.5px solid #ffcdd2", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#c62828", fontWeight: 500 },
  loginBtn: { marginTop: 8, padding: "15px", background: "#033f85", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.2px" },
  spinner: { display: "inline-block", animation: "spin 1s linear infinite" },
  dividerRow: { display: "flex", alignItems: "center", gap: 10, margin: "20px 0" },
  dividerLine: { flex: 1, height: 1, background: "#ebebeb" },
  dividerText: { fontSize: 12, color: "#bbb", fontWeight: 600 },
  newReportBtn: { width: "100%", padding: "13px", background: "#f0f2f7", color: "#033f85", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" },
  footer: { marginTop: 24, fontSize: 11, color: "#bbb", textAlign: "center" },
};
