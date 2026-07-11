// server/src/utils/sendEmail.js
// Sends the password reset link via Brevo's transactional email HTTP API
// (https://api.brevo.com), not raw SMTP. Render's free tier blocks
// outbound SMTP ports (25, 465, 587) to prevent spam abuse, but normal
// HTTPS (port 443) is unrestricted, so a REST API call works reliably in
// production while still working the exact same way locally.

const sendEmail = async ({ to, subject, html }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: process.env.SMTP_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Brevo email send failed:', response.status, errorBody);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;