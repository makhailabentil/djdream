const nodemailer = require("nodemailer");

const PACKAGE_LABELS = {
  starter: "Enchant Starter",
  signature: "Dream Signature",
  grand: "Grand Celebration",
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatCharacters = (characters) => {
  if (Array.isArray(characters)) {
    return characters.filter(Boolean).join(", ") || "None selected";
  }

  return characters ? String(characters) : "None selected";
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const gmailUser = process.env.GMAIL_USER || "dandjdream@gmail.com";
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const inbox = process.env.BOOKING_INBOX || gmailUser;

  if (!gmailAppPassword) {
    return res.status(500).json({
      ok: false,
      error: "Email service is not configured yet.",
    });
  }

  const {
    name = "",
    email = "",
    phone = "",
    eventDate = "",
    eventPackage = "",
    eventTime = "",
    eventType = "",
    characters = "",
    message = "",
  } = req.body || {};

  if (!name.trim() || !email.trim() || !phone.trim() || !eventDate.trim()) {
    return res.status(400).json({ ok: false, error: "Missing required fields." });
  }

  const packageLabel = PACKAGE_LABELS[eventPackage] || eventPackage || "Not selected";
  const characterList = formatCharacters(characters);

  const plainText = [
    "New booking inquiry - D&J Dream Entertainment",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Event Date: ${eventDate}`,
    `Preferred Package: ${packageLabel}`,
    `Preferred Time: ${eventTime || "Not selected"}`,
    `Event Type: ${eventType || "Not selected"}`,
    `Dream Characters: ${characterList}`,
    "",
    "Message:",
    message || "(No message provided)",
  ].join("\n");

  const html = `
    <h2>New booking inquiry - D&amp;J Dream Entertainment</h2>
    <table cellpadding="6" cellspacing="0" border="0">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>
      <tr><td><strong>Event Date</strong></td><td>${escapeHtml(eventDate)}</td></tr>
      <tr><td><strong>Preferred Package</strong></td><td>${escapeHtml(packageLabel)}</td></tr>
      <tr><td><strong>Preferred Time</strong></td><td>${escapeHtml(eventTime || "Not selected")}</td></tr>
      <tr><td><strong>Event Type</strong></td><td>${escapeHtml(eventType || "Not selected")}</td></tr>
      <tr><td><strong>Dream Characters</strong></td><td>${escapeHtml(characterList)}</td></tr>
    </table>
    <p><strong>Message</strong></p>
    <p>${escapeHtml(message || "(No message provided)").replace(/\n/g, "<br>")}</p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    await transporter.sendMail({
      from: `"D&J Dream Website" <${gmailUser}>`,
      to: inbox,
      replyTo: email,
      subject: `New booking inquiry from ${name}`,
      text: plainText,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Booking email failed:", error);
    return res.status(500).json({ ok: false, error: "Unable to send inquiry email." });
  }
};
