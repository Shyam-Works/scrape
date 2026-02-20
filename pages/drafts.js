import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Drafts() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sendAllConfirm, setSendAllConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) { router.push("/login"); return; }
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/drafts");
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch { alert("Failed to load drafts"); }
    finally { setLoading(false); }
  };

  const handleEdit = (draft) => {
    localStorage.setItem("orderData", JSON.stringify(draft));
    router.push("/");
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/drafts?id=${id}`, { method: "DELETE" });
      if (res.ok) setDrafts(drafts.filter(d => d._id !== id));
      else alert("Failed to delete draft");
    } catch { alert("Error deleting draft"); }
    finally { setDeleteConfirm(null); }
  };

  const handleSend = (draft) => {
    localStorage.setItem("orderData", JSON.stringify(draft));
    router.push("/review");
  };

  const handleSendAll = async () => {
    setSendAllConfirm(false);
    setSending(true);
    try {
      const res = await fetch("/api/send-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) { alert(`✅ ${data.draftsSent} orders sent!`); fetchDrafts(); }
      else alert(`Failed: ${data.error}`);
    } catch { alert("Error sending consolidated email"); }
    finally { setSending(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/login");
  };

  const getItemCount = (formData) => {
    if (!formData) return 0;
    return Object.values(formData).reduce((t, cat) =>
      t + Object.values(cat).filter(i => i.quantity !== 0).length, 0);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={s.root}>
      <Head>
        <title>Drafts · Scrap Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>Pending Drafts</div>
          {!loading && <div style={s.headerSub}>{drafts.length} order{drafts.length !== 1 ? "s" : ""} waiting</div>}
        </div>
        <div style={s.headerActions}>
          <button onClick={() => router.push("/")} style={s.newBtn}>+ New</button>
          <button onClick={handleLogout} style={s.logoutBtn}>Out</button>
        </div>
      </div>

      {/* Send All Banner */}
      {drafts.length > 1 && (
        <div style={s.banner}>
          <div>
            <div style={s.bannerTitle}>Send All at Once</div>
            <div style={s.bannerSub}>{drafts.length} orders → 1 consolidated email</div>
          </div>
          <button onClick={() => setSendAllConfirm(true)} disabled={sending} style={s.sendAllBtn}>
            {sending ? "..." : "📧 Send All"}
          </button>
        </div>
      )}

      {/* Content */}
      <div style={s.content}>
        {loading ? (
          <div style={s.loadingWrap}>
            {[1,2,3].map(i => <div key={i} style={s.skeleton} />)}
          </div>
        ) : drafts.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>📭</div>
            <div style={s.emptyTitle}>No pending drafts</div>
            <div style={s.emptyText}>All orders have been sent or nothing has been saved yet.</div>
            <button onClick={() => router.push("/")} style={s.createBtn}>Create New Report</button>
          </div>
        ) : (
          <div style={s.draftList}>
            {drafts.map((draft) => {
              const count = getItemCount(draft.formData);
              const initials = draft.name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?";
              return (
                <div key={draft._id} style={s.card}>
                  {/* Card top */}
                  <div style={s.cardTop}>
                    <div style={s.cardAvatar}>{initials}</div>
                    <div style={s.cardInfo}>
                      <div style={s.cardName}>{draft.orderNo ? `${draft.orderNo} · ` : ""}{draft.name}</div>
                      <div style={s.cardEmail}>{draft.email}</div>
                    </div>
                    <div style={s.cardBadge}>{count} item{count !== 1 ? "s" : ""}</div>
                  </div>

                  {/* Meta */}
                  <div style={s.metaRow}>
                    <div style={s.metaChip}>📍 {draft.store}</div>
                    {draft.vender && <div style={s.metaChip}>🏢 {draft.vender.split("(")[0].trim()}</div>}
                    <div style={s.metaChip}>🕐 {timeAgo(draft.updatedAt)}</div>
                  </div>

                  {/* Actions */}
                  <div style={s.cardActions}>
                    <button onClick={() => handleEdit(draft)} style={s.editBtn}>✏️ Edit</button>
                    <button onClick={() => handleSend(draft)} style={s.sendBtn}>📧 Send</button>
                    <button onClick={() => setDeleteConfirm(draft._id)} style={s.deleteBtn}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation sheet */}
      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={s.sheet} onClick={e => e.stopPropagation()}>
            <div style={s.sheetHandle} />
            <div style={s.sheetIcon}>🗑️</div>
            <div style={s.sheetTitle}>Delete this draft?</div>
            <div style={s.sheetText}>This action cannot be undone.</div>
            <button onClick={() => handleDelete(deleteConfirm)} style={s.sheetDeleteBtn}>Yes, Delete</button>
            <button onClick={() => setDeleteConfirm(null)} style={s.sheetCancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Send All confirmation sheet */}
      {sendAllConfirm && (
        <div style={s.overlay} onClick={() => setSendAllConfirm(false)}>
          <div style={s.sheet} onClick={e => e.stopPropagation()}>
            <div style={s.sheetHandle} />
            <div style={s.sheetIcon}>📧</div>
            <div style={s.sheetTitle}>Send all {drafts.length} orders?</div>
            <div style={s.sheetText}>All pending orders will be combined into one consolidated email report.</div>
            <button onClick={handleSendAll} style={s.sheetSendBtn}>Yes, Send All</button>
            <button onClick={() => setSendAllConfirm(false)} style={s.sheetCancelBtn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root: { maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#f0f2f7", fontFamily: "'DM Sans', sans-serif", paddingBottom: 20 },

  header: { background: "#033f85", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  headerTitle: { color: "#fff", fontWeight: 700, fontSize: 18 },
  headerSub: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 },
  headerActions: { display: "flex", gap: 8 },
  newBtn: { background: "#28a745", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 20, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  logoutBtn: { background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 20, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  banner: { background: "linear-gradient(135deg, #ff6b35, #e85d04)", margin: "12px 16px 0", borderRadius: 16, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  bannerTitle: { color: "#fff", fontWeight: 700, fontSize: 14 },
  bannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  sendAllBtn: { background: "#fff", color: "#e85d04", border: "none", borderRadius: 12, padding: "10px 16px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 },

  content: { padding: "12px 16px" },

  loadingWrap: { display: "flex", flexDirection: "column", gap: 10, marginTop: 4 },
  skeleton: { height: 120, background: "#e8eaf0", borderRadius: 16, animation: "pulse 1.5s ease-in-out infinite" },

  emptyState: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#999", lineHeight: 1.5, marginBottom: 24 },
  createBtn: { padding: "13px 28px", background: "#033f85", color: "#fff", border: "none", borderRadius: 14, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" },

  draftList: { display: "flex", flexDirection: "column", gap: 10 },
  card: { background: "#fff", borderRadius: 16, padding: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },

  cardTop: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  cardAvatar: { width: 44, height: 44, background: "#033f85", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontWeight: 700, fontSize: 14, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardEmail: { fontSize: 12, color: "#999", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardBadge: { background: "#eef3ff", color: "#033f85", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "4px 10px", flexShrink: 0 },

  metaRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 },
  metaChip: { background: "#f5f6fa", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#555" },

  cardActions: { display: "flex", gap: 8 },
  editBtn: { flex: 1, padding: "11px 8px", background: "#eef3ff", color: "#033f85", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  sendBtn: { flex: 1, padding: "11px 8px", background: "#033f85", color: "#fff", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  deleteBtn: { padding: "11px 14px", background: "#fff0f0", color: "#dc3545", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 14, cursor: "pointer" },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" },
  sheet: { width: "100%", maxWidth: 480, margin: "0 auto", background: "#fff", borderRadius: "20px 20px 0 0", padding: "8px 24px 36px", boxSizing: "border-box", textAlign: "center" },
  sheetHandle: { width: 36, height: 4, background: "#ddd", borderRadius: 2, margin: "0 auto 20px" },
  sheetIcon: { fontSize: 40, marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 8 },
  sheetText: { fontSize: 14, color: "#888", marginBottom: 24, lineHeight: 1.5 },
  sheetDeleteBtn: { display: "block", width: "100%", padding: "14px", background: "#dc3545", color: "#fff", border: "none", borderRadius: 14, fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10 },
  sheetSendBtn: { display: "block", width: "100%", padding: "14px", background: "#033f85", color: "#fff", border: "none", borderRadius: 14, fontFamily: "inherit", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10 },
  sheetCancelBtn: { display: "block", width: "100%", padding: "14px", background: "#f0f2f7", color: "#444", border: "none", borderRadius: 14, fontFamily: "inherit", fontSize: 16, fontWeight: 600, cursor: "pointer" },
};
