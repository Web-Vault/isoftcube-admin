// models/AboutPage.js
import mongoose from "mongoose";

const AboutSectionSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const VisionSectionSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const ValueSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const TeamMemberSchema = new mongoose.Schema({
  name: String,
  role: String,
  bio: String,
  image: String,
});

const AboutPageSchema = new mongoose.Schema({
  sections: [AboutSectionSchema],
  ourVision: [VisionSectionSchema],
  ourValues: [ValueSchema],
  teamMembers: [TeamMemberSchema],
});

export default mongoose.models.AboutPage ||
  mongoose.model("AboutPage", AboutPageSchema);
