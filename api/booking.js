const nodemailer = require("nodemailer");

const PACKAGE_LABELS = {
  starter: "Enchant Starter",
  signature: "Dream Signature",
  grand: "Grand Celebration",
};

const LOCATION_SMTP = {
  "newburgh-hudson": {
    id: "newburgh-hudson",
    label: "Newburgh-Hudson Valley, NY",
    userEnv: "GMAIL_USER_NEWBURGH",
    passwordEnv: "GMAIL_APP_PASSWORD_NEWBURGH",
    defaultUser: "dandjnewburgh@gmail.com",
  },
  baltimore: {
    id: "baltimore",
    label: "Baltimore, MD",
    userEnv: "GMAIL_USER_BALTIMORE",
    passwordEnv: "GMAIL_APP_PASSWORD_BALTIMORE",
    defaultUser: "dandjbmore@gmail.com",
  },
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

const normalizeLocationKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, "-")
    .replace(/\s+/g, "-");

const resolveServiceLocation = (serviceLocation = "") => {
  const raw = String(serviceLocation || "").trim();
  if (!raw) {
    return null;
  }

  const normalized = normalizeLocationKey(raw);

  if (LOCATION_SMTP[normalized]) {
    return LOCATION_SMTP[normalized];
  }

  if (normalized.includes("newburgh") || normalized.includes("hudson")) {
    return LOCATION_SMTP["newburgh-hudson"];
  }

  if (normalized.includes("baltimore")) {
    return LOCATION_SMTP.baltimore;
  }

  for (const location of Object.values(LOCATION_SMTP)) {
    if (normalizeLocationKey(location.label) === normalized) {
      return location;
    }
  }

  return null;
};

const resolveSmtpCredentials = (location) => {
  const legacyUser = process.env.GMAIL_USER || "";
  const legacyPassword = process.env.GMAIL_APP_PASSWORD || "";
  const legacyInbox = process.env.BOOKING_INBOX || "";

  if (!location) {
    if (legacyPassword && (legacyUser || legacyInbox)) {
      const user = legacyUser || legacyInbox;
      return {
        user,
        password: legacyPassword,
        inbox: legacyInbox || user,
        source: "legacy",
      };
    }

    return null;
  }

  const locationUser =
    process.env[location.userEnv] || location.defaultUser;
  const locationPassword = process.env[location.passwordEnv] || "";

  if (locationPassword) {
    return {
      user: locationUser,
      password: locationPassword,
      inbox: locationUser,
      source: location.id,
    };
  }

  // Mid-migration fallback: reuse legacy creds when location-specific
  // app password is not set yet.
  if (legacyPassword) {
    const user = legacyUser || locationUser;
    return {
      user,
      password: legacyPassword,
      inbox: legacyInbox || locationUser || user,
      source: "legacy-fallback",
    };
  }

  return {
    user: locationUser,
    password: "",
    inbox: locationUser,
    source: location.id,
    missingPassword: true,
  };
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const {
    name = "",
    email = "",
    phone = "",
    eventDate = "",
    eventPackage = "",
    eventTime = "",
    eventType = "",
    serviceLocation = "",
    characters = "",
    message = "",
  } = req.body || {};

  if (!name.trim() || !email.trim() || !phone.trim() || !eventDate.trim()) {
    return res.status(400).json({ ok: false, error: "Missing required fields." });
  }

  const location = resolveServiceLocation(serviceLocation);
  const smtp = resolveSmtpCredentials(location);
  const locationLabel =
    location?.label || String(serviceLocation || "").trim() || "Not selected";

  if (!smtp || smtp.missingPassword) {
    return res.status(500).json({
      ok: false,
      error: location
        ? "Email service is not configured for this location yet."
        : "Email service is not configured yet.",
    });
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
    `Service Location: ${locationLabel}`,
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
      <tr><td><strong>Service Location</strong></td><td>${escapeHtml(locationLabel)}</td></tr>
      <tr><td><strong>Dream Characters</strong></td><td>${escapeHtml(characterList)}</td></tr>
    </table>
    <p><strong>Message</strong></p>
    <p>${escapeHtml(message || "(No message provided)").replace(/\n/g, "<br>")}</p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtp.user,
        pass: smtp.password,
      },
    });

    await transporter.sendMail({
      from: `"D&J Dream Website" <${smtp.user}>`,
      to: smtp.inbox,
      replyTo: email,
      subject: `New booking inquiry from ${name} (${locationLabel})`,
      text: plainText,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Booking email failed:", error);
    return res.status(500).json({ ok: false, error: "Unable to send inquiry email." });
  }
};
