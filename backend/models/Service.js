import mongoose from "mongoose";

const SubServiceSchema = new mongoose.Schema({
  name: String,
  description: String,
  technologies: [String],
  features: [String],
});

const ServiceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    icon: { type: String }, // store icon name or URL, not the imported component
    shortDescription: String,
    fullDescription: String,
    features: [String],
    technologies: [String],
    benefits: [String],
    subServices: [SubServiceSchema],
  },
  { timestamps: true }
);

const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

export default Service;
