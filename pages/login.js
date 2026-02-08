import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple client-side check (you can also do server-side)
    // For production, use proper authentication
    const AUTH_USERNAME = "admin"; // Change in production
    const AUTH_PASSWORD = "admin123"; // Change in production

    if (username === AUTH_USERNAME && password === AUTH_PASSWORD) {
      // Store auth in localStorage (for simple implementation)
      localStorage.setItem("isAuthenticated", "true");
      router.push("/drafts");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Login - Scrap Material Tracker</title>
      </Head>

      <div style={styles.loginBox}>
        <h1 style={styles.heading}>🔐 Login</h1>
        <p style={styles.subtitle}>Access Pending Drafts</p>

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter username"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.loginButton}>
            Login
          </button>
        </form>

        <div style={styles.divider}>OR</div>

        <button 
          onClick={() => router.push("/")} 
          style={styles.newReportButton}
        >
          Create New Report
        </button>

        {/* <div style={styles.credentials}>
          <p style={styles.credText}>Default Credentials:</p>
          <p style={styles.credDetail}>Username: <strong>admin</strong></p>
          <p style={styles.credDetail}>Password: <strong>admin123</strong></p>
        </div> */}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7f9",
    fontFamily: "sans-serif",
  },
  loginBox: {
    backgroundColor: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  heading: {
    textAlign: "center",
    color: "#333",
    marginBottom: "0.5rem",
    fontSize: "1.8rem",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "2rem",
    fontSize: "0.95rem",
  },
  inputGroup: {
    marginBottom: "1.2rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "1rem",
  },
  error: {
    color: "#d32f2f",
    fontSize: "0.85rem",
    marginTop: "0.5rem",
    marginBottom: "1rem",
    textAlign: "center",
    fontWeight: "500",
  },
  loginButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#033f85",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  divider: {
    textAlign: "center",
    margin: "1.5rem 0",
    color: "#999",
    fontSize: "0.85rem",
    position: "relative",
  },
  newReportButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  credentials: {
    marginTop: "2rem",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    border: "1px dashed #ddd",
  },
  credText: {
    fontSize: "0.8rem",
    color: "#666",
    marginBottom: "0.5rem",
  },
  credDetail: {
    fontSize: "0.85rem",
    color: "#555",
    margin: "0.3rem 0",
  },
};