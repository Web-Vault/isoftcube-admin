import express from 'express';
import ContactSubmission from '../models/ContactSubmission.js';
import nodemailer from 'nodemailer';

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
    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
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