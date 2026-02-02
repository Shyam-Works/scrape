import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Review() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem("orderData");
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      router.push("/"); // Back to home if no data found
    }
  }, [router]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Report sent successfully!");
        localStorage.removeItem("orderData");
        router.push("/");
      } else {
        alert("Failed to send email. Please check your .env settings.");
      }
    } catch (error) {
      alert("Error sending report.");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <p style={{textAlign: "center", marginTop: "50px"}}>Loading...</p>;

  // Flatten the items so we only show what has a quantity > 0
  const selectedItems = Object.entries(data.formData).flatMap(([cat, items]) =>
    Object.values(items).filter((item) => item.quantity > 0)
  );

  return (
    <div style={styles.container}>
      <Head>
        <title>Review Report</title>
      </Head>
      <h2 style={styles.heading}>Review Summary</h2>

      <div style={styles.infoSection}>
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Engineer:</strong> {data.engineer}</p>
        {data.vender && <p><strong>Vendor:</strong> {data.vender}</p>}
      </div>

      <h3 style={styles.subheading}>Selected Materials</h3>
      {selectedItems.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>{item.id}</td>
                <td style={styles.td}>{item.name}</td>
                <td style={{...styles.td, fontWeight: "bold"}}>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{textAlign: "center", color: "red"}}>No items selected!</p>
      )}

      <div style={styles.buttonRow}>
        <button 
          onClick={() => router.back()} 
          style={styles.backButton}
          disabled={loading}
        >
          Edit
        </button>
        <button 
          onClick={handleConfirm} 
          style={styles.confirmButton}
          disabled={loading || selectedItems.length === 0}
        >
          {loading ? "Sending..." : "Confirm & Send Email"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "2rem", maxWidth: "600px", margin: "20px auto", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", fontFamily: "sans-serif" },
  heading: { textAlign: "center", color: "#333" },
  subheading: { marginTop: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" },
  infoSection: { backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px", lineHeight: "1.6" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "15px" },
  thRow: { backgroundColor: "#eee" },
  th: { padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" },
  td: { padding: "10px", borderBottom: "1px solid #eee" },
  buttonRow: { marginTop: "30px", display: "flex", gap: "15px" },
  backButton: { flex: 1, padding: "12px", backgroundColor: "#6c757d", color: "#white", border: "none", borderRadius: "6px", cursor: "pointer", color: "white" },
  confirmButton: { flex: 2, padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }
};