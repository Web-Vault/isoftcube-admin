import express from 'express';
import SiteConfig from '../models/SiteConfig.js';

const router = express.Router();

// Create a new site config
router.post('/', async (req, res) => {
  try {
    const config = new SiteConfig(req.body);
    await config.save();
    res.status(201).json(config);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all site configs
router.get('/', async (req, res) => {
  try {
    const configs = await SiteConfig.find();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single site config by ID
router.get('/:id', async (req, res) => {
  try {
    const config = await SiteConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ error: 'Site config not found' });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a site config by ID
router.put('/:id', async (req, res) => {
  try {
    const config = await SiteConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!config) return res.status(404).json({ error: 'Site config not found' });
    res.json(config);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a site config by ID
router.delete('/:id', async (req, res) => {
  try {
    const config = await SiteConfig.findByIdAndDelete(req.params.id);
    if (!config) return res.status(404).json({ error: 'Site config not found' });
    res.json({ message: 'Site config deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update support email and app password
router.post('/:id/support-email', async (req, res) => {
  const { supportEmail, supportAppPassword } = req.body;
  if (!supportEmail || !supportAppPassword) {
    return res.status(400).json({ error: 'Support email and app password are required.' });
  }
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(supportEmail)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  try {
    const config = await SiteConfig.findByIdAndUpdate(
      req.params.id,
      { supportEmail, supportAppPassword },
      { new: true }
    );
    if (!config) return res.status(404).json({ error: 'Site config not found' });
    res.json(config);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove support email and app password
router.delete('/:id/support-email', async (req, res) => {
  try {
    const config = await SiteConfig.findByIdAndUpdate(
      req.params.id,
      { $unset: { supportEmail: "", supportAppPassword: "" } },
      { new: true }
    );
    if (!config) return res.status(404).json({ error: 'Site config not found' });
    res.json(config);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 