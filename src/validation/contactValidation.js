function validateContactForm(payload) {
  const errors = [];

  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim();
  const subject = (payload.subject || "").trim();
  const message = (payload.message || "").trim();

  if (name.length < 2) errors.push("Name must be at least 2 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Enter a valid email address.");
  if (subject.length < 4) errors.push("Subject must be at least 4 characters.");
  if (message.length < 12) errors.push("Message must be at least 12 characters.");

  return {
    isValid: errors.length === 0,
    errors,
    values: { name, email, subject, message }
  };
}

module.exports = { validateContactForm };
