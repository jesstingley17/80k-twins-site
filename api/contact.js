const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      // keep as-is; validation below will fail
    }
  }

  const name = (body?.name || "").toString().trim();
  const email = (body?.email || "").toString().trim();
  const message = (body?.message || "").toString().trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await resend.emails.send({
      from: "80k Twins Contact <no-reply@yourdomain.com>",
      to: ["info@80ktwins.com", "kamar@80ktwins.com", "kiyel@80ktwins.com"],
      subject: `New contact form message from ${name}`,
      reply_to: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error sending contact email via Resend:", error);
    return res.status(500).json({ error: "Error sending email." });
  }
};


