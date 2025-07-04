import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: String,
    department: String,
    location: String,
    type: String,
    experience: String,
    genderPreference: String,
    description: String,
    requirements: [String],
    responsibilities: [String],
    benefits: [String],
    salary: String,
    icon: String, // store icon name as string
    postedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

export default Job;
