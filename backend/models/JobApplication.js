import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    experience: { type: String },
    coverLetter: { type: String },
    resumeUrl: { type: String }, // URL to uploaded resume (optional)
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    appliedAt: { type: Date, default: Date.now },
    reply: { type: String, default: ""},
    replied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const JobApplication = mongoose.models.JobApplication || mongoose.model("JobApplication", JobApplicationSchema);

export default JobApplication; 