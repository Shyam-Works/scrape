import nodemailer from "nodemailer";
import dbConnect from "../../lib/mongodb";
import Draft from "../../models/Draft";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  await dbConnect();

  const { _id, name, email, store, orderNo, formData, vender } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const recipientUpper = name ? name.toUpperCase() : "";
  const orderHeader = orderNo ? `${orderNo} ${name}` : name;

  const itemTable = Object.entries(formData)
    .map(([category, items]) => {
      const validItems = Object.values(items).filter(
        (item) => item.quantity && item.quantity !== 0
      );

      if (validItems.length === 0) return "";

      return validItems
        .map(
          (item) => `
          <tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td align="center">${item.quantity}</td>
            <td></td>
            <td></td>
            <td align="center">0003</td>
            <td align="center">TD02</td>
            <td align="center">0010</td>
            <td></td>
            <td></td>
            <td>${recipientUpper}</td>
          </tr>
        `
        )
        .join("");
    })
    .join("");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmation - ${orderHeader}`,
    html: `
      <h2>${orderHeader}</h2>
      <p><strong>Store Location:</strong> ${store}</p>
      ${vender ? `<p><strong>Vendor:</strong> ${vender}</p>` : ''}

      <h3>Order Details</h3>

      <table border="1" cellpadding="5" cellspacing="0"
        style="border-collapse: collapse; width: 100%; font-size: 12px;">
        <thead>
          <tr style="background-color: #e9c46a;">
            <th>Component</th>
            <th>Description</th>
            <th>Reqmnt Qnt</th>
            <th>UM</th>
            <th>LC</th>
            <th>Sloc</th>
            <th>Plnt</th>
            <th>Act.</th>
            <th>Batch</th>
            <th>Proc. Category</th>
            <th>Recipient</th>
          </tr>
        </thead>
        <tbody>
          ${itemTable}
        </tbody>
      </table>
    `,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);

    // Mark draft as sent if _id is provided
    if (_id) {
      await Draft.findByIdAndUpdate(_id, {
        status: 'sent',
        sentAt: new Date(),
      });
    } else {
      // Create a new record marked as sent
      const draft = new Draft({
        name,
        email,
        store,
        orderNo,
        formData,
        vender,
        status: 'sent',
        sentAt: new Date(),
      });
      await draft.save();
    }

    res.status(200).send("Email sent!");
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).send("Error sending email.");
  }
}
