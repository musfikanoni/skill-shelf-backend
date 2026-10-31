// Run: node test-smtp.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  secure: false,
  auth: {
    user: '8a3ec3ef4506b5',
    pass: '9a2fd94620039e'
  },
  tls: { rejectUnauthorized: false }
});

async function test() {
  try {
    // 1. Verify SMTP connection
    await transporter.verify();
    console.log('✅ SMTP connection OK');

    // 2. Send test email
    const info = await transporter.sendMail({
      from: '"SkillShelf" <test@skillshelf.com>',
      to: 'test@example.com',
      subject: 'Test OTP Email',
      html: '<h2>Your OTP is: <strong>1234</strong></h2><p>Valid for 2 minutes.</p>'
    });

    console.log('✅ Email sent! Message ID:', info.messageId);
    console.log('📬 Check your Mailtrap inbox at: https://mailtrap.io/inboxes');
  } catch (err) {
    console.error('❌ SMTP Error:', err.message);
    console.error('Full error:', err);
  }
}

test();
