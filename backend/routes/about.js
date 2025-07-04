import express from 'express';
import AboutPage from '../models/AboutPage.js';

const router = express.Router();

// Create a new about page entry
router.post('/', async (req, res) => {
  try {
    const about = new AboutPage(req.body);
    await about.save();
    res.status(201).json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all about page entries
router.get('/', async (req, res) => {
  try {
    const abouts = await AboutPage.find();
    res.json(abouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single about page entry by ID
router.get('/:id', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    res.json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an about page entry by ID
router.put('/:id', async (req, res) => {
  try {
    const about = await AboutPage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an about page entry by ID
router.delete('/:id', async (req, res) => {
  try {
    const about = await AboutPage.findByIdAndDelete(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    res.json({ message: 'About entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Update a section by index
router.patch('/:id/section/:sectionIdx', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    about.sections[req.params.sectionIdx] = req.body;
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Add a new section
router.post('/:id/section', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    about.sections.push(req.body);
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Remove a section by index
router.delete('/:id/section/:sectionIdx', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    about.sections.splice(req.params.sectionIdx, 1);
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH: Update a team member by index
router.patch('/:id/member/:memberIdx', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    about.teamMembers[req.params.memberIdx] = req.body;
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Add a new team member
router.post('/:id/member', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    about.teamMembers.push(req.body);
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Remove a team member by index
router.delete('/:id/member/:memberIdx', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    about.teamMembers.splice(req.params.memberIdx, 1);
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH: Update a value by index
router.patch('/:id/value/:valueIdx', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    about.ourValues[req.params.valueIdx] = req.body;
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST: Add a new value
router.post('/:id/value', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    about.ourValues.push(req.body);
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Remove a value by index
router.delete('/:id/value/:valueIdx', async (req, res) => {
  try {
    const about = await AboutPage.findById(req.params.id);
    if (!about) return res.status(404).json({ error: 'About entry not found' });
    about.ourValues.splice(req.params.valueIdx, 1);
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 