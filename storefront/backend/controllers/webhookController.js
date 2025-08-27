import { saveOrder } from "../services/orderStorage.js";

export async function handleOrderPaid(req, res) {
  try {
    const { orderId, customerEmail, productId } = req.body;

    if (!orderId || !customerEmail || !productId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("✅ Payment confirmed for order:", orderId);

    const digitalCard = await generateSignedCard(productId, customerEmail);

    await sendEmailWithAttachment({
      to: customerEmail,
      subject: "Your Digital Product",
      body: "Thank you for your purchase. Your product is attached.",
      attachment: digitalCard,
    });

    console.log("📬 Digital product sent to:", customerEmail);

    saveOrder({ orderId, customerEmail, productId });

    res
      .status(200)
      .json({ success: true, message: "Digital product delivered" });
  } catch (err) {
    console.error("❌ Error in webhook handler:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function generateSignedCard(productId, customerEmail) {
  const dummyFile = Buffer.from(`Digital card for ${customerEmail}`, "utf-8");
  return {
    filename: `digital-card-${productId}.txt`,
    content: dummyFile,
  };
}

async function sendEmailWithAttachment({ to, subject, body, attachment }) {
  console.log(`📨 Sending email to ${to} with file: ${attachment.filename}`);
  await new Promise((r) => setTimeout(r, 1000));
}
