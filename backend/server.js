import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import serviceRoutes from './routes/service.js';
import jobRoutes from './routes/job.js';
import aboutRoutes from './routes/about.js';
import siteConfigRoutes from './routes/siteConfig.js';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Use routes (to be added)
app.use('/api/services', serviceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/site-config', siteConfigRoutes);

// Add root route for health check
app.get('/', (req, res) => {
  res.send('API Server is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 