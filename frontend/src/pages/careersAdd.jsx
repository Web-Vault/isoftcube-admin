import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Define API base URL from env
const API_BASE_URL = process.env.REACT_APP_BASE_URL || '';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

const CareersAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    department: "",
    location: "",
    type: "",
    experience: "",
    genderPreference: "",
    salary: "",
    postedDate: "",
    description: "",
    requirements: [""],
    responsibilities: [""],
    benefits: [""],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      // If editing title and slug hasn't been manually edited, update slug
      if (name === "title" && !slugEdited) {
        return { ...prev, title: value, slug: slugify(value) };
      }
      // If editing slug, set slugEdited to true
      if (name === "slug") {
        setSlugEdited(true);
      }
      return { ...prev, [name]: value };
    });
  };

  const handleArrayChange = (field, idx, value) => {
    const arr = [...form[field]];
    arr[idx] = value;
    setForm({ ...form, [field]: arr });
  };

  const handleAddArrayItem = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const handleRemoveArrayItem = (field, idx) => {
    const arr = [...form[field]];
    arr.splice(idx, 1);
    setForm({ ...form, [field]: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let slug = form.slug.trim();
    if (!slug) {
      slug = slugify(form.title);
    }
    const payload = {
      ...form,
      slug,
      requirements: form.requirements.filter(r => r && r.trim() !== ""),
      responsibilities: form.responsibilities.filter(r => r && r.trim() !== ""),
      benefits: form.benefits.filter(b => b && b.trim() !== ""),
    };
    try {
      await axios.post(`${API_BASE_URL}/api/jobs`, payload);
      navigate("/careers");
    } catch (err) {
      if (err.response?.data?.error && err.response.data.error.includes('duplicate key')) {
        setError("A job with this slug already exists. Please use a different title or slug.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Add Job Vacancy</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Slug</label>
          <input name="slug" value={form.slug} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Auto-generated from title if left blank" />
        </div>
        <div>
          <label className="block font-medium mb-1">Department</label>
          <input name="department" value={form.department} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Type</label>
          <input name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Experience</label>
          <input name="experience" value={form.experience} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Gender Preference</label>
          <input name="genderPreference" value={form.genderPreference} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Salary</label>
          <input name="salary" value={form.salary} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Posted Date</label>
          <input name="postedDate" value={form.postedDate} onChange={handleChange} className="w-full border rounded px-3 py-2" type="date" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        {/* Requirements */}
        <div>
          <label className="block font-medium mb-1">Requirements</label>
          {form.requirements.map((req, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input value={req} onChange={e => handleArrayChange("requirements", idx, e.target.value)} className="flex-1 border rounded px-3 py-2" required />
              <button type="button" onClick={() => handleRemoveArrayItem("requirements", idx)} className="px-2 text-red-500">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => handleAddArrayItem("requirements")}
            className="text-blue-600 hover:underline text-sm">+ Add Requirement</button>
        </div>
        {/* Responsibilities */}
        <div>
          <label className="block font-medium mb-1">Responsibilities</label>
          {form.responsibilities.map((resp, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input value={resp} onChange={e => handleArrayChange("responsibilities", idx, e.target.value)} className="flex-1 border rounded px-3 py-2" required />
              <button type="button" onClick={() => handleRemoveArrayItem("responsibilities", idx)} className="px-2 text-red-500">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => handleAddArrayItem("responsibilities")}
            className="text-blue-600 hover:underline text-sm">+ Add Responsibility</button>
        </div>
        {/* Benefits */}
        <div>
          <label className="block font-medium mb-1">Benefits</label>
          {form.benefits.map((benefit, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input value={benefit} onChange={e => handleArrayChange("benefits", idx, e.target.value)} className="flex-1 border rounded px-3 py-2" required />
              <button type="button" onClick={() => handleRemoveArrayItem("benefits", idx)} className="px-2 text-red-500">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => handleAddArrayItem("benefits")}
            className="text-blue-600 hover:underline text-sm">+ Add Benefit</button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700" disabled={loading}>
            {loading ? "Saving..." : "Add Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CareersAdd; 