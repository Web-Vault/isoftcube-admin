import express from 'express';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import nodemailer from 'nodemailer';
import SiteConfig from '../models/SiteConfig.js';

const router = express.Router();

// Create a new job
router.post('/', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all job applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await JobApplication.find().populate('jobId');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all applications for a specific job
router.get('/:id/applications', async (req, res) => {
  try {
    const applications = await JobApplication.find({ jobId: req.params.id }).populate('jobId');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a job by ID
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a job by ID
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to a job application and send email
router.post('/applications/:applicationId/reply', async (req, res) => {
  const { applicationId } = req.params;
  const { reply } = req.body;
  if (!reply) return res.status(400).json({ error: 'Reply is required' });
  try {
    const application = await JobApplication.findById(applicationId);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    // Fetch the job to get its title
    const job = await Job.findById(application.jobId);
    // Fetch support email and app password from SiteConfig
    const siteConfig = await SiteConfig.findOne();
    const supportEmail = siteConfig?.supportEmail || process.env.SMTP_USER;
    const supportAppPassword = siteConfig?.supportAppPassword || process.env.SMTP_PASS;
    // Send email using nodemailer
    // Configure your transporter (use your SMTP credentials or a test account)
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: supportEmail,
        pass: supportAppPassword,
      },
    });
    const mailOptions = {
      from: supportEmail,
      to: application.email,
      subject: `Reply to your job application for ${job ? job.title : application.jobId}`,
      html: `<p>Dear ${application.name},</p><p>${reply.replace(/\n/g, '<br>')}</p><p>Best regards,<br>Admin Team</p>`
    };
    await transporter.sendMail(mailOptions);
    // Update application with reply
    application.reply = reply;
    application.replied = true;
    await application.save();
    res.json({ message: 'Reply sent and application updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 