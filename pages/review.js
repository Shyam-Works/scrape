import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Review() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null); // 'send' | 'draft'
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem("orderData");
    if (storedData) setData(JSON.parse(storedData));
    else router.push("/");
  }, [router]);

  const handleConfirm = async () => {
    setLoading(true);
    setAction("send");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        localStorage.removeItem("orderData");
        router.push("/?sent=1");
      } else alert("Failed to send email.");
    } catch { alert("Error sending report."); }
    finally { setLoading(false); setAction(null); }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setAction("draft");
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        localStorage.removeItem("orderData");
        router.push("/");
      } else alert("Failed to save draft");
    } catch { alert("Error saving draft"); }
    finally { setLoading(false); setAction(null); }
  };

  if (!data) return (
    <div style={s.root}>
      <div style={s.loadingWrap}><div style={s.loadDot} />Loading...</div>
    </div>
  );

  const selectedItems = Object.entries(data.formData).flatMap(([cat, items]) =>
    Object.values(items).filter(item => item.quantity !== 0).map(item => ({ ...item, category: cat }))
  );

  const orderHeader = data.orderNo ? `${data.orderNo} · ${data.name}` : data.name;

  return (
    <div style={s.root}>
      <Head>
        <title>Review · Scrap Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <div style={s.header}>
        <button onClick={() => router.back()} style={s.backBtn}>← Back</button>
        <span style={s.headerTitle}>Review Order</span>
        <div style={{ width: 60 }} />
      </div>

      <div style={s.content}>
        {/* Order identity */}
        <div style={s.identityCard}>
          <div style={s.avatar}>{data.name?.[0]?.toUpperCase() || "?"}</div>
          <div>
            <div style={s.orderName}>{orderHeader}</div>
            <div style={s.orderEmail}>{data.email}</div>
          </div>
        </div>

        {/* Info chips */}
        <div style={s.chipsRow}>
          <div style={s.chip}><span style={s.chipIcon}>📍</span>{data.store}</div>
          {data.vender && <div style={s.chip}><span style={s.chipIcon}>🏢</span>{data.vender.split("(")[0].trim()}</div>}
        </div>

        {/* Items */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>Materials</span>
            <span style={s.sectionBadge}>{selectedItems.length} items</span>
          </div>

          {selectedItems.length === 0 ? (
            <div style={s.emptyItems}>
              <div style={s.emptyIcon}>📦</div>
              <div style={s.emptyText}>No materials selected</div>
              <button onClick={() => router.back()} style={s.goBackBtn}>Add Materials</button>
            </div>
          ) : (
            <div style={s.itemsList}>
              {selectedItems.map((item, i) => (
                <div key={item.id} style={{ ...s.itemRow, ...(i === selectedItems.length - 1 ? { borderBottom: "none" } : {}) }}>
                  <div style={s.itemLeft}>
                    <div style={s.itemName}>{item.name}</div>
                    <div style={s.itemMeta}>{item.id} · {item.category}</div>
                  </div>
                  <div style={s.qtyBadge}>{item.quantity}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning if no items */}
        {selectedItems.length === 0 && (
          <div style={s.warningBox}>⚠️ Add at least one material before sending.</div>
        )}
      </div>

      {/* Bottom action bar */}
      <div style={s.bottomBar}>
        <button onClick={handleSaveDraft} disabled={loading} style={s.draftBtn}>
          {loading && action === "draft" ? "Saving..." : "💾 Save Draft"}
        </button>
        <button onClick={handleConfirm} disabled={loading || selectedItems.length === 0} style={{ ...s.sendBtn, opacity: selectedItems.length === 0 ? 0.4 : 1 }}>
          {loading && action === "send" ? "Sending..." : "📧 Send Report"}
        </button>
      </div>
    </div>
  );
}

const s = {
  root: { maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#f0f2f7", fontFamily: "'DM Sans', sans-serif", paddingBottom: 90 },
  loadingWrap: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 10, color: "#888", fontSize: 15 },
  loadDot: { width: 8, height: 8, background: "#033f85", borderRadius: "50%" },

  header: { background: "#033f85", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  backBtn: { background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 20, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  headerTitle: { color: "#fff", fontWeight: 700, fontSize: 16 },

  content: { padding: 16 },

  identityCard: { background: "#fff", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 10 },
  avatar: { width: 48, height: 48, background: "#033f85", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700, flexShrink: 0 },
  orderName: { fontWeight: 700, fontSize: 16, color: "#111" },
  orderEmail: { fontSize: 13, color: "#888", marginTop: 2 },

  chipsRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 },
  chip: { background: "#fff", borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: "#444", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  chipIcon: { fontSize: 13 },

  section: { background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 14 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f0f2f7" },
  sectionTitle: { fontWeight: 700, fontSize: 14, color: "#333" },
  sectionBadge: { background: "#033f85", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "3px 10px" },

  emptyItems: { padding: "40px 20px", textAlign: "center" },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: "#999", fontSize: 14, marginBottom: 16 },
  goBackBtn: { padding: "10px 24px", background: "#033f85", color: "#fff", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer" },

  itemsList: { padding: "0 4px" },
  itemRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px", borderBottom: "1px solid #f5f6fa", gap: 10 },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: 600, color: "#222", lineHeight: 1.3 },
  itemMeta: { fontSize: 11, color: "#aaa", marginTop: 2 },
  qtyBadge: { background: "#eef3ff", color: "#033f85", borderRadius: 10, padding: "5px 12px", fontSize: 14, fontWeight: 700, flexShrink: 0 },

  warningBox: { background: "#fff8e1", border: "1.5px solid #ffc107", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#856404", fontWeight: 500 },

  bottomBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #e8eaf0", padding: "12px 16px", display: "flex", gap: 10, boxSizing: "border-box", zIndex: 100 },
  draftBtn: { padding: "13px 18px", background: "#f0f2f7", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#444" },
  sendBtn: { flex: 1, padding: "13px", background: "#28a745", color: "#fff", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" },
};
