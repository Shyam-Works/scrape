import nodemailer from "nodemailer";
import dbConnect from "../../lib/mongodb";
import Draft from "../../models/Draft";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  await dbConnect();

  try {
    // Get all pending drafts
    const drafts = await Draft.find({ status: 'draft' }).sort({ createdAt: 1 });

    if (drafts.length === 0) {
      return res.status(400).json({ error: "No pending drafts to send" });
    }

    // Get recipient email from request or use the first draft's email
    const recipientEmail = req.body.recipientEmail || drafts[0].email;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Build combined email with all orders
    let combinedOrders = "";
    const draftIds = [];

    drafts.forEach((draft, index) => {
      draftIds.push(draft._id);
      const orderNumber = index + 1;
      const recipientUpper = draft.name ? draft.name.toUpperCase() : "";

      // Build item table for this order
      const itemTable = Object.entries(draft.formData || {})
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

      // Add this order to combined email
      combinedOrders += `
        <div style="margin-bottom: 40px; page-break-after: always;">
          <h2 style="background-color: #033f85; color: white; padding: 15px; margin: 0;">
            Order #${orderNumber}
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd;">
            <p><strong>Recipient Name:</strong> ${draft.name}</p>
            <p><strong>Email:</strong> ${draft.email}</p>
            <p><strong>Store Location:</strong> ${draft.store}</p>
            ${draft.engineer ? `<p><strong>Engineer:</strong> ${draft.engineer}</p>` : ''}
            ${draft.vender ? `<p><strong>Vendor:</strong> ${draft.vender}</p>` : ''}
            ${draft.orderNo ? `<p><strong>Order Number:</strong> ${draft.orderNo}</p>` : ''}
          </div>

          <h3 style="margin-top: 20px;">Order Details</h3>

          <table border="1" cellpadding="5" cellspacing="0"
            style="border-collapse: collapse; width: 100%; font-size: 12px; margin-bottom: 30px;">
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
        </div>
      `;
    });

    // Create summary section
    const summary = `
      <div style="background-color: #033f85; color: white; padding: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0;">Consolidated Scrap Material Report</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">
          Total Orders: ${drafts.length} | Date: ${new Date().toLocaleDateString()}
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Consolidated Scrap Material Report - ${drafts.length} Orders - ${new Date().toLocaleDateString()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @media print {
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px;">
          ${summary}
          ${combinedOrders}
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #033f85;">
            <p style="margin: 0;"><strong>End of Report</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
              This report contains ${drafts.length} consolidated orders.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    // Send the combined email
    await transporter.sendMail(mailOptions);

    // Mark all drafts as sent
    await Draft.updateMany(
      { _id: { $in: draftIds } },
      { 
        status: 'sent',
        sentAt: new Date()
      }
    );

    res.status(200).json({ 
      message: "All drafts sent successfully in one email!",
      draftsSent: drafts.length
    });
  } catch (error) {
    console.error("Bulk Send Error:", error);
    res.status(500).json({ 
      error: "Error sending consolidated email",
      details: error.message 
    });
  }
}