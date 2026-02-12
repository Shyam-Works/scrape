import { useState, useEffect } from "react";
import items from "../data/items.json";
import { useRouter } from "next/router";
import Head from "next/head";

// Vendor list (single source of truth)
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

export default function Home() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    store: "",
    vender: "",
    orderNo: "",
  });

  const [formData, setFormData] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedData = localStorage.getItem("orderData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTimeout(() => {
          setUserInfo({
            name: parsed.name || "",
            email: parsed.email || "",
            store: parsed.store || "",
            vender: parsed.vender || "",
            orderNo: parsed.orderNo || "",
          });
          if (parsed.formData) setFormData(parsed.formData);
          if (parsed._id) setDraftId(parsed._id);
        }, 0);
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }
  }, []);

  const handleUserChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (category, itemName, value, id) => {
    let numValue = parseFloat(value);

    if (!isNaN(numValue) && numValue > 0) {
      numValue = numValue * -1;
    }

    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [id]: {
          id,
          name: itemName,
          quantity: isNaN(numValue) ? 0 : numValue,
        },
      },
    }));
  };

  const handleSaveDraft = async () => {
    if (!userInfo.name.trim() || !userInfo.email.trim() || !userInfo.store) {
      alert("Please enter Name, Email, and Store before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...userInfo,
        formData,
      };

      // If editing existing draft, include the ID
      if (draftId) {
        payload._id = draftId;
      }

      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setDraftId(data.draft._id);
        alert("Draft saved successfully! You can come back later to complete it.");
        
        // Clear localStorage after saving to database
        localStorage.removeItem("orderData");
      } else {
        alert("Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Error saving draft");
    } finally {
      setSaving(false);
    }
  };

  const handleReview = () => {
    if (!userInfo.name.trim() || !userInfo.email.trim() || !userInfo.store) {
      alert("Please enter Name, Email, and Store.");
      return;
    }

    const data = { ...userInfo, formData };
    if (draftId) data._id = draftId;
    
    localStorage.setItem("orderData", JSON.stringify(data));
    router.push("/review");
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Scrap Material Report</title>
      </Head>

      <div style={styles.topBar}>
        <h1 style={styles.heading}>Scrap Material Tracker</h1>
        <button onClick={() => router.push("/login")} style={styles.viewDraftsButton}>
          📋 View Drafts
        </button>
      </div>

      <div style={styles.inputContainer}>
        <h2 style={styles.sectionTitle}>User Information</h2>

        <label style={styles.label}>Recipient Name*</label>
        <input
          style={styles.fullInput}
          type="text"
          value={userInfo.name}
          onChange={(e) => handleUserChange("name", e.target.value)}
          placeholder="Full Name"
        />

        <label style={styles.label}>Recipient Email*</label>
        <input
          style={styles.fullInput}
          type="email"
          value={userInfo.email}
          onChange={(e) => handleUserChange("email", e.target.value)}
          placeholder="your@gmail.com"
        />

        <label style={styles.label}>Store Location*</label>
        <select
          style={styles.fullInput}
          value={userInfo.store}
          onChange={(e) => handleUserChange("store", e.target.value)}
        >
          <option value="">-- Select Store --</option>
          <option value="A stn -0501">A stn -0501</option>
          <option value="D stn-9042">D stn-9042</option>
          <option value="E stn -0503">E stn -0503</option>
          <option value="B stn 0500">B stn 0500</option>
        </select>

        <label style={styles.label}>Vendor Name</label>
        <select
          style={styles.fullInput}
          value={userInfo.vender}
          onChange={(e) => handleUserChange("vender", e.target.value)}
        >
          <option value="">Select A Vendor</option>
          {VENDORS.map((vendor) => (
            <option key={vendor} value={vendor}>
              {vendor}
            </option>
          ))}
        </select>

        <label style={styles.label}>Order Number</label>
        <input
          style={styles.fullInput}
          type="text"
          value={userInfo.orderNo}
          onChange={(e) => handleUserChange("orderNo", e.target.value)}
          placeholder="Optional"
        />
      </div>

      <h2 style={styles.sectionTitle}>
        Material List (Positive numbers become negative)
      </h2>

      {Object.entries(items).map(([category, itemList], index) => (
        <div key={category} style={styles.categoryBox}>
          <div
            style={
              index % 2 === 0
                ? { ...styles.header, backgroundColor: "#033f85" }
                : { ...styles.header, backgroundColor: "#373e5e" }
            }
            onClick={() =>
              setOpenCategory(openCategory === category ? null : category)
            }
          >
            <span>{category}</span>
            <span>{openCategory === category ? "−" : "+"}</span>
          </div>

          {openCategory === category && (
            <div style={styles.itemList}>
              {itemList.map((item) => (
                <div key={item.id} style={styles.itemRow}>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontWeight: "bold" }}>{item.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      {item.id}
                    </div>
                  </div>
                  <input
                    style={styles.inputField}
                    type="number"
                    step="any"
                    placeholder="0"
                    value={formData[category]?.[item.id]?.quantity || ""}
                    onChange={(e) =>
                      handleInputChange(
                        category,
                        item.name,
                        e.target.value,
                        item.id
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={styles.actionButtons}>
        <button 
          onClick={handleSaveDraft} 
          style={styles.saveDraftButton}
          disabled={saving}
        >
          {saving ? "Saving..." : "💾 Save Draft"}
        </button>
        <button onClick={handleReview} style={styles.reviewButton}>
          ✅ Review & Send
        </button>
      </div>

      {draftId && (
        <p style={styles.draftInfo}>
          ✓ This draft is saved. You can close this page and come back later.
        </p>
      )}
    </div>
  );
}

const styles = {
  container: { 
    padding: "1rem", 
    maxWidth: "600px", 
    margin: "0 auto", 
    backgroundColor: "#f4f7f9", 
    minHeight: "100vh", 
    fontFamily: "sans-serif" 
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  heading: { 
    color: "#333", 
    fontSize: "1.5rem",
    margin: 0,
  },
  viewDraftsButton: {
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  sectionTitle: { 
    fontSize: "1.1rem", 
    marginBottom: "10px", 
    color: "#555", 
    fontWeight: "bold" 
  },
  inputContainer: { 
    backgroundColor: "#fff", 
    padding: "1.2rem", 
    borderRadius: "10px", 
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)", 
    marginBottom: "1.5rem" 
  },
  label: { 
    display: "block", 
    marginBottom: "5px", 
    fontSize: "0.9rem", 
    fontWeight: "600" 
  },
  fullInput: { 
    width: "100%", 
    padding: "10px", 
    marginBottom: "15px", 
    borderRadius: "5px", 
    border: "1px solid #ccc", 
    boxSizing: "border-box" 
  },
  categoryBox: { 
    marginBottom: "10px", 
    borderRadius: "8px", 
    overflow: "hidden", 
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
  },
  header: { 
    padding: "12px 15px", 
    color: "#fff", 
    cursor: "pointer", 
    display: "flex", 
    justifyContent: "space-between", 
    fontWeight: "bold" 
  },
  itemList: { 
    padding: "10px", 
    backgroundColor: "#fff", 
    maxHeight: "400px", 
    overflowY: "auto" 
  },
  itemRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "10px 0", 
    borderBottom: "1px solid #eee" 
  },
  inputField: { 
    width: "80px", 
    padding: "8px", 
    textAlign: "center", 
    border: "1px solid #ccc", 
    borderRadius: "5px" 
  },
  actionButtons: { 
    display: "flex",
    gap: "10px",
    marginTop: "2rem",
  },
  saveDraftButton: {
    flex: 1,
    padding: "15px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem",
  },
  reviewButton: { 
    flex: 1,
    padding: "15px", 
    backgroundColor: "#28a745", 
    color: "white",
    border: "none", 
    borderRadius: "8px", 
    fontWeight: "bold", 
    cursor: "pointer", 
    fontSize: "1rem",
  },
  draftInfo: {
    textAlign: "center",
    marginTop: "1rem",
    color: "#28a745",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
};
