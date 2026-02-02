import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { name, email, store, orderNo, formData, engineer, vender } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const itemTable = Object.entries(formData)
    .map(([category, items]) => {
      const itemEntries = Object.values(items).filter((item) => item.quantity > 0);
      if (itemEntries.length === 0) return '';

      return itemEntries.map((item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.id}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
            <td align="center" style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${category}</td>
          </tr>
        `).join('');
    })
    .join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email, 
    subject: `Material Report: ${name} - ${new Date().toLocaleDateString()}`,
    html: `
      <h3>Material Submission Details</h3>
      <p><strong>Submitted By:</strong> ${name}</p>
      <p><strong>Store/Site:</strong> ${store}</p>
      <p><strong>Engineer:</strong> ${engineer}</p>
      <p><strong>Vendor:</strong> ${vender}</p>
      
      <h4>Items List</h4>
      <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead>
          <tr style="background-color: #033f85; color: white;">
            <th style="padding: 10px; border: 1px solid #ddd;">ID</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Description</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Qty / Weight</th>
            <th style="padding: 10px; border: 1px solid #ddd;">Category</th>
          </tr>
        </thead>
        <tbody>
          ${itemTable}
        </tbody>
      </table>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent!");
  } catch (error) {
    res.status(500).send("Error sending email.");
  }
}