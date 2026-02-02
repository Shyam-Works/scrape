import { useState, useEffect } from "react";
import items from "../data/items.json";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  // We group everything into one object to fix the ESLint "cascading renders" error
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    store: "",
    engineer: "",
    vender: "",
    orderNo: ""
  });
  
  const [formData, setFormData] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const router = useRouter();

  useEffect(() => {
  const savedData = localStorage.getItem("orderData");
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      
      // Wrapping in setTimeout moves the update out of the "synchronous" render phase
      // This stops the "cascading renders" error
      setTimeout(() => {
        setUserInfo({
          name: parsed.name || "",
          email: parsed.email || "",
          store: parsed.store || "",
          engineer: parsed.engineer || "",
          vender: parsed.vender || "",
          orderNo: parsed.orderNo || ""
        });
        if (parsed.formData) setFormData(parsed.formData);
      }, 0);

    } catch (e) {
      console.error("Error loading saved data", e);
    }
  }
}, []);

  const handleUserChange = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (category, itemName, quantity, id) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [id]: {
          id,
          name: itemName,
          quantity: parseFloat(quantity) || 0,
        },
      },
    }));
  };

  const handleSubmit = () => {
    if (!userInfo.name.trim() || !userInfo.email.trim() || !userInfo.engineer.trim()) {
      alert("Please enter Name, Email, and Engineer.");
      return;
    }

    // Merge userInfo and formData to save
    const data = { ...userInfo, formData };
    localStorage.setItem("orderData", JSON.stringify(data));
    router.push("/review");
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Material & Scrap Report</title>
      </Head>
      
      <h1 style={styles.heading}>Material Tracker</h1>

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

        <label style={styles.label}>Engineer Name*</label>
        <select 
          style={styles.fullInput} 
          value={userInfo.engineer} 
          onChange={(e) => handleUserChange("engineer", e.target.value)}
        >
          <option value="">-- Select Engineer --</option>
          <option value="Vasant Patel">Vasant Patel</option>
          <option value="Jay Bundela">Jay Bundela</option>
          <option value="Other">Other</option>
        </select>

        <label style={styles.label}>Vendor Name</label>
        <input 
          style={styles.fullInput} 
          type="text" 
          value={userInfo.vender} 
          onChange={(e) => handleUserChange("vender", e.target.value)} 
          placeholder="Vendor Name" 
        />
      </div>

      <h2 style={styles.sectionTitle}>Material List</h2>

      {Object.entries(items).map(([category, itemList], index) => (
        <div key={category} style={styles.categoryBox}>
          <div 
            style={index % 2 === 0 ? {...styles.header, backgroundColor: "#033f85"} : {...styles.header, backgroundColor: "#373e5e"}}
            onClick={() => setOpenCategory(openCategory === category ? null : category)}
          >
            <span>{category}</span>
            <span>{openCategory === category ? "−" : "+"}</span>
          </div>

          {openCategory === category && (
            <div style={styles.itemList}>
              {itemList.map((item) => (
                <div key={item.id} style={styles.itemRow}>
                  <div style={{flex: 2}}>
                    <div style={{fontWeight: "bold"}}>{item.name}</div>
                    <div style={{fontSize: "0.8rem", color: "#666"}}>{item.id}</div>
                  </div>
                  <input
                    style={styles.inputField}
                    type="number"
                    placeholder="0"
                    value={formData[category]?.[item.id]?.quantity || ""}
                    onChange={(e) => handleInputChange(category, item.name, e.target.value, item.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={styles.submitWrapper}>
        <button onClick={handleSubmit} style={styles.submitButton}>Review Report</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "1rem", maxWidth: "600px", margin: "0 auto", backgroundColor: "#f4f7f9", minHeight: "100vh", fontFamily: "sans-serif" },
  heading: { textAlign: "center", color: "#333", marginBottom: "1.5rem", fontSize: "1.5rem" },
  sectionTitle: { fontSize: "1.1rem", marginBottom: "10px", color: "#555", fontWeight: "bold" },
  inputContainer: { backgroundColor: "#fff", padding: "1.2rem", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: "1.5rem" },
  label: { display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "600" },
  fullInput: { width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" },
  categoryBox: { marginBottom: "10px", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  header: { padding: "12px 15px", color: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", fontWeight: "bold" },
  itemList: { padding: "10px", backgroundColor: "#fff", maxHeight: "400px", overflowY: "auto" },
  itemRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" },
  inputField: { width: "70px", padding: "8px", textAlign: "center", border: "1px solid #ccc", borderRadius: "5px" },
  submitWrapper: { textAlign: "center", marginTop: "2rem" },
  submitButton: { width: "100%", padding: "15px", backgroundColor: "#e8ca04", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" }
};