import mongoose from 'mongoose';

const SiteConfigSchema = new mongoose.Schema({
  siteName: String,
  logoUrl: String,
  faviconUrl: String,
  heroTexts: {
    home: String,
    services: String,
    contact: String,
  },
  contactEmails: [String],
  contactPhones: [String],
  contactAddress: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    Instagram: String,
    // ...etc
  }
  // ...add more as needed
});

export default mongoose.models.SiteConfig || mongoose.model('SiteConfig', SiteConfigSchema);
