import mongoose from 'mongoose';

const BlogSectionSchema = new mongoose.Schema({
  image: { type: String }, // optional
  text: { type: String },  // optional
}, { _id: false });

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String }, // optional
  coverImage: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  content: { type: [BlogSectionSchema], required: true },
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema); 