import express from 'express';
import ContactSubmission from '../models/ContactSubmission.js';
import nodemailer from 'nodemailer';
import SiteConfig from '../models/SiteConfig.js';

const router = express.Router();

// GET all contact submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact submissions.' });
  }
});

// POST reply to a contact submission and send email
router.post('/:id/reply', async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  if (!reply) return res.status(400).json({ error: 'Reply is required' });
  try {
    const submission = await ContactSubmission.findById(id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    // Fetch support email and app password from SiteConfig
    const siteConfig = await SiteConfig.findOne();
    console.log('siteConfig:', siteConfig);
     
    const supportEmail = siteConfig?.supportEmail || process.env.SMTP_USER;
    const supportAppPassword = siteConfig?.supportAppPassword || process.env.SMTP_PASS;
    console.log('supportEmail:', supportEmail);
    console.log('supportAppPassword:', supportAppPassword);
    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: supportEmail,
        pass: supportAppPassword,
      },
    });
    const mailOptions = {
      from: supportEmail,
      to: submission.email,
      subject: `Reply to your contact submission`,
      html: `<p>Dear ${submission.name},</p><p>${reply.replace(/\n/g, '<br>')}</p><p>Best regards,<br>Admin Team</p>`
    };
    await transporter.sendMail(mailOptions);
    // Update submission with reply
    submission.reply = reply;
    submission.replied = true;
    await submission.save();
    res.json({ message: 'Reply sent and submission updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 