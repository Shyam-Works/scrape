import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Drafts() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      router.push("/login");
      return;
    }

    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/drafts");
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      alert("Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (draft) => {
    // Save to localStorage and redirect to edit
    localStorage.setItem("orderData", JSON.stringify(draft));
    router.push("/");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    try {
      const res = await fetch(`/api/drafts?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDrafts(drafts.filter((d) => d._id !== id));
        alert("Draft deleted successfully");
      } else {
        alert("Failed to delete draft");
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      alert("Error deleting draft");
    }
  };

  const handleSend = (draft) => {
    // Save to localStorage and redirect to review
    localStorage.setItem("orderData", JSON.stringify(draft));
    router.push("/review");
  };

  const handleSendAll = async () => {
    if (drafts.length === 0) {
      alert("No drafts to send!");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to send ALL ${drafts.length} drafts in ONE consolidated email?\n\n` +
      `All orders will be combined into a single email report.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/send-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Success! All ${data.draftsSent} orders sent in one email!`);
        // Refresh the drafts list
        fetchDrafts();
      } else {
        alert(`Failed to send: ${data.error}`);
      }
    } catch (error) {
      console.error("Error sending all drafts:", error);
      alert("Error sending consolidated email");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/login");
  };

  const getItemCount = (formData) => {
    if (!formData) return 0;
    return Object.values(formData).reduce((total, category) => {
      return total + Object.values(category).filter(item => item.quantity !== 0).length;
    }, 0);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: "center", marginTop: "50px" }}>Loading drafts...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Head>
        <title>Pending Drafts - Scrap Material Tracker</title>
      </Head>

      <div style={styles.header}>
        <h1 style={styles.heading}>📋 Pending Drafts</h1>
        <div style={styles.headerActions}>
          <button onClick={() => router.push("/")} style={styles.newButton}>
            + New Report
          </button>
          {drafts.length > 0 && (
            <button 
              onClick={handleSendAll} 
              style={styles.sendAllButton}
              disabled={loading}
            >
              {loading ? "Sending..." : `📧 Send All (${drafts.length})`}
            </button>
          )}
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No pending drafts found</p>
          <button onClick={() => router.push("/")} style={styles.createButton}>
            Create Your First Report
          </button>
        </div>
      ) : (
        <>
          {drafts.length > 1 && (
            <div style={styles.infoBanner}>
              <strong>💡 Tip:</strong> Use the Send-All button to combine all {drafts.length} orders into ONE single email instead of sending them individually.
            </div>
          )}
          <div style={styles.draftsList}>
          {drafts.map((draft) => (
            <div key={draft._id} style={styles.draftCard}>
              <div style={styles.draftHeader}>
                <div>
                  <h3 style={styles.draftName}>{draft.orderNo ? `${draft.orderNo} ${draft.name}` : draft.name}</h3>
                  <p style={styles.draftEmail}>{draft.email}</p>
                </div>
                <span style={styles.badge}>{getItemCount(draft.formData)} items</span>
              </div>

              <div style={styles.draftInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Store:</span>
                  <span style={styles.infoValue}>{draft.store}</span>
                </div>
                {draft.vender && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Vendor:</span>
                    <span style={styles.infoValue}>{draft.vender}</span>
                  </div>
                )}
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Last Updated:</span>
                  <span style={styles.infoValue}>
                    {new Date(draft.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={styles.actions}>
                <button
                  onClick={() => handleEdit(draft)}
                  style={styles.editButton}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleSend(draft)}
                  style={styles.sendButton}
                >
                  📧 Send
                </button>
                <button
                  onClick={() => handleDelete(draft._id)}
                  style={styles.deleteButton}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "1.5rem",
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#f4f7f9",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  heading: {
    color: "#333",
    fontSize: "1.8rem",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "10px",
  },
  newButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  sendAllButton: {
    padding: "10px 20px",
    backgroundColor: "#ff6b35",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "background-color 0.3s",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#666",
    marginBottom: "1.5rem",
  },
  infoBanner: {
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    color: "#856404",
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  createButton: {
    padding: "12px 30px",
    backgroundColor: "#033f85",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
  },
  draftsList: {
    display: "grid",
    gap: "1.5rem",
  },
  draftCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  draftHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #f0f0f0",
  },
  draftName: {
    margin: "0 0 0.3rem 0",
    fontSize: "1.3rem",
    color: "#333",
  },
  draftEmail: {
    margin: 0,
    color: "#666",
    fontSize: "0.9rem",
  },
  badge: {
    backgroundColor: "#e9c46a",
    color: "#333",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  draftInfo: {
    marginBottom: "1.5rem",
  },
  infoRow: {
    display: "flex",
    padding: "0.5rem 0",
  },
  infoLabel: {
    fontWeight: "600",
    color: "#555",
    minWidth: "120px",
  },
  infoValue: {
    color: "#333",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  editButton: {
    flex: 1,
    minWidth: "100px",
    padding: "10px 15px",
    backgroundColor: "#033f85",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  sendButton: {
    flex: 1,
    minWidth: "100px",
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    minWidth: "100px",
    padding: "10px 15px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
