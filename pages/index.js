import { useState, useEffect, useRef } from "react";
import items from "../data/items.json";
import { useRouter } from "next/router";
import Head from "next/head";

const VENDORS = [
  "Chief (22106)",
  "ANR (23784)",
  "Active (22189)",
  "Mayu (19683)",
  "DA (23780)",
  "Vinayak (23782)",
  "VN (22126)",
  "Sai (24805)",
  "Active Electrical (22189)",
  "Vr Electrical (22127)",
  "Shailee projects PVT.LTD (14489)",
  "Manishbhai Rajnikantbhai Choksi (19681)",
];

const STORES = [
  { value: "0501", label: "A stn", sub: "0501" },
  { value: "9042", label: "D stn", sub: "9042" },
  { value: "0503", label: "E stn", sub: "0503" },
  { value: "0500", label: "B stn", sub: "0500" },
];

const STEPS = ["info", "items", "review"];

export default function Home() {
  const [step, setStep] = useState(0); // 0=info, 1=items, 2=done
  const [userInfo, setUserInfo] = useState({ name: "", email: "", store: "", vender: "", orderNo: "" });
  const [formData, setFormData] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showVendorSheet, setShowVendorSheet] = useState(false);
  const router = useRouter();
  const itemsRef = useRef(null);

  useEffect(() => {
    const savedData = localStorage.getItem("orderData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUserInfo({ name: parsed.name || "", email: parsed.email || "", store: parsed.store || "", vender: parsed.vender || "", orderNo: parsed.orderNo || "" });
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed._id) setDraftId(parsed._id);
      } catch (e) {}
    }
  }, []);

  const handleUserChange = (field, value) => setUserInfo(prev => ({ ...prev, [field]: value }));

  const handleInputChange = (category, itemName, value, id) => {
    let numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) numValue = numValue * -1;
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [id]: { id, name: itemName, quantity: isNaN(numValue) ? 0 : numValue },
      },
    }));
  };

  const totalItems = Object.values(formData).reduce((acc, cat) => {
    return acc + Object.values(cat).filter(i => i.quantity && i.quantity !== 0).length;
  }, 0);

  const canProceed = userInfo.name.trim() && userInfo.email.trim() && userInfo.store;

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = { ...userInfo, formData };
      if (draftId) payload._id = draftId;
      const res = await fetch("/api/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        setDraftId(data.draft._id);
        localStorage.removeItem("orderData");
        alert("Draft saved!");
      } else alert("Failed to save draft");
    } catch { alert("Error saving draft"); }
    finally { setSaving(false); }
  };

  const handleReview = () => {
    const data = { ...userInfo, formData };
    if (draftId) data._id = draftId;
    localStorage.setItem("orderData", JSON.stringify(data));
    router.push("/review");
  };

  // Flat search across all items
  const allItems = Object.entries(items).flatMap(([cat, list]) => list.map(i => ({ ...i, category: cat })));
  const filteredItems = searchTerm.length > 1 ? allItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.id.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  const selectedStore = STORES.find(s => s.value === userInfo.store);

  return (
    <div style={s.root}>
      <Head>
        <title>Scrap Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>Scrap Tracker</div>
          {draftId && <div style={s.draftBadge}>● Draft saved</div>}
        </div>
        <button onClick={() => router.push("/login")} style={s.draftsBtn}>Drafts</button>
      </div>

      {/* Step Pills */}
      <div style={s.stepBar}>
        {["1. Info", "2. Materials", "3. Send"].map((label, i) => (
          <div key={i} style={{ ...s.stepPill, ...(step === i ? s.stepActive : step > i ? s.stepDone : {}) }}>
            {step > i ? "✓ " : ""}{label}
          </div>
        ))}
      </div>

      {/* ── STEP 0: User Info ── */}
      {step === 0 && (
        <div style={s.card}>
          <p style={s.cardLabel}>Who is submitting?</p>

          <input style={s.input} type="text" placeholder="Your full name *" value={userInfo.name} onChange={e => handleUserChange("name", e.target.value)} />
          <input style={s.input} type="email" placeholder="Email address *" value={userInfo.email} onChange={e => handleUserChange("email", e.target.value)} inputMode="email" autoCapitalize="none" />
          <input style={s.input} type="text" placeholder="Order # (optional)" value={userInfo.orderNo} onChange={e => handleUserChange("orderNo", e.target.value)} />

          <p style={s.cardLabel}>Store Location *</p>
          <div style={s.storePicker}>
            {STORES.map(store => (
              <button key={store.value} onClick={() => handleUserChange("store", store.value)}
                style={{ ...s.storeBtn, ...(userInfo.store === store.value ? s.storeBtnActive : {}) }}>
                <span style={s.storeLetter}>{store.label}</span>
                <span style={s.storeSub}>{store.sub}</span>
              </button>
            ))}
          </div>

          <p style={s.cardLabel}>Vendor (optional)</p>
          <button onClick={() => setShowVendorSheet(true)} style={s.vendorPickerBtn}>
            <span style={{ color: userInfo.vender ? "#111" : "#999" }}>{userInfo.vender || "Select vendor..."}</span>
            <span style={{ color: "#999" }}>›</span>
          </button>

          <button
            onClick={() => { if (canProceed) setStep(1); else alert("Please fill Name, Email and Store."); }}
            style={{ ...s.primaryBtn, opacity: canProceed ? 1 : 0.4 }}>
            Next → Add Materials
          </button>
        </div>
      )}

      {/* ── STEP 1: Items ── */}
      {step === 1 && (
        <div>
          {/* Summary bar */}
          <div style={s.summaryBar}>
            <span style={s.summaryText}>{selectedStore ? `${selectedStore.label} · ${selectedStore.sub}` : ""} · {totalItems} item{totalItems !== 1 ? "s" : ""}</span>
            <button onClick={() => setStep(0)} style={s.editBtn}>Edit Info</button>
          </div>

          {/* Search */}
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              type="search"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoCapitalize="none"
            />
            {searchTerm && <button onClick={() => setSearchTerm("")} style={s.clearBtn}>✕</button>}
          </div>

          {/* Search results */}
          {searchTerm.length > 1 && (
            <div style={s.searchResults}>
              {filteredItems.length === 0 && <div style={s.noResults}>No items found</div>}
              {filteredItems.map(item => (
                <div key={item.id} style={s.searchItem}>
                  <div style={{ flex: 1 }}>
                    <div style={s.itemName}>{item.name}</div>
                    <div style={s.itemId}>{item.id} · {item.category}</div>
                  </div>
                  <input
                    style={s.qtyInput}
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={formData[item.category]?.[item.id]?.quantity || ""}
                    onChange={e => handleInputChange(item.category, item.name, e.target.value, item.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Categories */}
          {!searchTerm && Object.entries(items).map(([category, itemList], index) => {
            const catCount = Object.values(formData[category] || {}).filter(i => i.quantity && i.quantity !== 0).length;
            const isOpen = openCategory === category;
            return (
              <div key={category} style={s.catBox}>
                <button style={{ ...s.catHeader, backgroundColor: index % 2 === 0 ? "#033f85" : "#1e2a4a" }}
                  onClick={() => setOpenCategory(isOpen ? null : category)}>
                  <span style={s.catName}>{category}</span>
                  <div style={s.catRight}>
                    {catCount > 0 && <span style={s.catBadge}>{catCount}</span>}
                    <span style={s.catChevron}>{isOpen ? "−" : "+"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div style={s.itemsWrap} ref={itemsRef}>
                    {itemList.map(item => {
                      const val = formData[category]?.[item.id]?.quantity;
                      const hasValue = val && val !== 0;
                      return (
                        <div key={item.id} style={{ ...s.itemRow, ...(hasValue ? s.itemRowActive : {}) }}>
                          <div style={{ flex: 1 }}>
                            <div style={s.itemName}>{item.name}</div>
                            <div style={s.itemId}>{item.id}</div>
                          </div>
                          <input
                            style={{ ...s.qtyInput, ...(hasValue ? s.qtyInputActive : {}) }}
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            value={val || ""}
                            onChange={e => handleInputChange(category, item.name, e.target.value, item.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom action bar */}
          <div style={s.bottomBar}>
            <button onClick={handleSaveDraft} disabled={saving} style={s.saveBtn}>
              {saving ? "..." : "💾 Save"}
            </button>
            <button onClick={handleReview} style={s.reviewBtn}>
              Review & Send {totalItems > 0 ? `(${totalItems})` : ""}
            </button>
          </div>
        </div>
      )}

      {/* Vendor Bottom Sheet */}
      {showVendorSheet && (
        <div style={s.overlay} onClick={() => setShowVendorSheet(false)}>
          <div style={s.sheet} onClick={e => e.stopPropagation()}>
            <div style={s.sheetHandle} />
            <p style={s.sheetTitle}>Select Vendor</p>
            <div style={s.sheetScroll}>
              <button style={s.sheetItem} onClick={() => { handleUserChange("vender", ""); setShowVendorSheet(false); }}>
                <span style={{ color: "#999" }}>None</span>
              </button>
              {VENDORS.map(v => (
                <button key={v} style={{ ...s.sheetItem, ...(userInfo.vender === v ? s.sheetItemActive : {}) }}
                  onClick={() => { handleUserChange("vender", v); setShowVendorSheet(false); }}>
                  {v} {userInfo.vender === v ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root: { maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#f0f2f7", fontFamily: "'DM Sans', sans-serif", paddingBottom: 100 },
  header: { background: "#033f85", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 },
  headerTitle: { color: "#fff", fontWeight: 700, fontSize: 18 },
  draftBadge: { color: "#7eb8ff", fontSize: 11, marginTop: 2 },
  draftsBtn: { background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: "7px 14px", borderRadius: 20, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  stepBar: { display: "flex", gap: 6, padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e8eaf0" },
  stepPill: { flex: 1, textAlign: "center", padding: "6px 4px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#eef0f5", color: "#888" },
  stepActive: { background: "#033f85", color: "#fff" },
  stepDone: { background: "#d4edda", color: "#28a745" },

  card: { margin: 16, background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  cardLabel: { fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 10, marginTop: 16, textTransform: "uppercase", letterSpacing: "0.5px" },

  input: { display: "block", width: "100%", padding: "13px 15px", marginBottom: 10, border: "1.5px solid #e0e3ed", borderRadius: 12, fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", background: "#fafbfd", outline: "none" },

  storePicker: { display: "flex", gap: 8, marginBottom: 4 },
  storeBtn: { flex: 1, padding: "12px 4px", border: "2px solid #e0e3ed", borderRadius: 12, background: "#fafbfd", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  storeBtnActive: { border: "2px solid #033f85", background: "#eef3ff" },
  storeLetter: { fontWeight: 700, fontSize: 14, color: "#033f85" },
  storeSub: { fontSize: 11, color: "#888" },

  vendorPickerBtn: { width: "100%", padding: "13px 15px", border: "1.5px solid #e0e3ed", borderRadius: 12, background: "#fafbfd", fontFamily: "inherit", fontSize: 15, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", marginBottom: 4, boxSizing: "border-box" },

  primaryBtn: { display: "block", width: "100%", marginTop: 20, padding: "15px", background: "#033f85", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" },

  summaryBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#fff", borderBottom: "1px solid #e8eaf0" },
  summaryText: { fontSize: 13, fontWeight: 600, color: "#444" },
  editBtn: { fontSize: 12, color: "#033f85", background: "none", border: "none", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", padding: "4px 0" },

  searchWrap: { position: "relative", margin: "12px 16px 8px", display: "flex", alignItems: "center", background: "#fff", borderRadius: 12, border: "1.5px solid #e0e3ed", padding: "0 12px" },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, border: "none", outline: "none", padding: "12px 0", fontSize: 15, fontFamily: "inherit", background: "transparent" },
  clearBtn: { background: "none", border: "none", fontSize: 14, color: "#999", cursor: "pointer", padding: 4 },

  searchResults: { margin: "0 16px 8px", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  noResults: { padding: 20, textAlign: "center", color: "#999", fontSize: 14 },

  catBox: { margin: "6px 16px", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  catHeader: { width: "100%", border: "none", padding: "14px 16px", color: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit" },
  catName: { fontWeight: 700, fontSize: 14 },
  catRight: { display: "flex", alignItems: "center", gap: 8 },
  catBadge: { background: "#fff", color: "#033f85", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "2px 8px" },
  catChevron: { fontSize: 18, color: "rgba(255,255,255,0.8)" },

  itemsWrap: { background: "#fff", maxHeight: 320, overflowY: "auto" },
  itemRow: { display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #f0f2f7", gap: 10 },
  itemRowActive: { background: "#eef3ff" },
  searchItem: { display: "flex", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #f5f5f5", gap: 10 },
  itemName: { fontSize: 13, fontWeight: 600, color: "#222", lineHeight: 1.3 },
  itemId: { fontSize: 11, color: "#999", marginTop: 2 },
  qtyInput: { width: 70, padding: "9px 8px", textAlign: "center", border: "1.5px solid #e0e3ed", borderRadius: 10, fontSize: 15, fontFamily: "inherit", background: "#fafbfd", boxSizing: "border-box", outline: "none" },
  qtyInputActive: { border: "1.5px solid #033f85", background: "#eef3ff", color: "#033f85", fontWeight: 700 },

  bottomBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #e8eaf0", padding: "12px 16px", display: "flex", gap: 10, boxSizing: "border-box", zIndex: 100 },
  saveBtn: { padding: "13px 18px", background: "#f0f2f7", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#444" },
  reviewBtn: { flex: 1, padding: "13px", background: "#033f85", color: "#fff", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer" },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" },
  sheet: { width: "100%", maxWidth: 480, margin: "0 auto", background: "#fff", borderRadius: "20px 20px 0 0", maxHeight: "70vh", display: "flex", flexDirection: "column" },
  sheetHandle: { width: 36, height: 4, background: "#ddd", borderRadius: 2, margin: "12px auto 4px" },
  sheetTitle: { fontSize: 16, fontWeight: 700, textAlign: "center", padding: "8px 0 12px", borderBottom: "1px solid #f0f0f0", margin: 0 },
  sheetScroll: { overflowY: "auto", flex: 1 },
  sheetItem: { display: "block", width: "100%", padding: "14px 20px", border: "none", borderBottom: "1px solid #f5f5f5", background: "none", fontFamily: "inherit", fontSize: 14, textAlign: "left", cursor: "pointer" },
  sheetItemActive: { background: "#eef3ff", fontWeight: 700, color: "#033f85" },
};
