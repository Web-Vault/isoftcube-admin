import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const emptySubService = { name: "", description: "", features: [""], technologies: [""] };

const ServicesAdd = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    tagline: "",
    description: "",
    features: [""],
    technologies: [""],
    benefits: [""],
    subServices: [{ ...emptySubService }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, idx, value) => {
    const arr = [...form[field]];
    arr[idx] = value;
    setForm({ ...form, [field]: arr });
  };

  const handleAddArrayItem = (field, emptyValue = "") => {
    setForm({ ...form, [field]: [...form[field], emptyValue] });
  };

  const handleRemoveArrayItem = (field, idx) => {
    const arr = [...form[field]];
    arr.splice(idx, 1);
    setForm({ ...form, [field]: arr });
  };

  // Sub-service handlers
  const handleSubServiceChange = (idx, key, value) => {
    const arr = [...form.subServices];
    arr[idx][key] = value;
    setForm({ ...form, subServices: arr });
  };

  const handleAddSubService = () => {
    setForm({ ...form, subServices: [...form.subServices, { ...emptySubService }] });
  };

  const handleRemoveSubService = (idx) => {
    const arr = [...form.subServices];
    arr.splice(idx, 1);
    setForm({ ...form, subServices: arr });
  };

  // Sub-service array handlers
  const handleSubServiceArrayChange = (subIdx, field, idx, value) => {
    const arr = [...form.subServices];
    const subArr = [...arr[subIdx][field]];
    subArr[idx] = value;
    arr[subIdx][field] = subArr;
    setForm({ ...form, subServices: arr });
  };

  const handleAddSubServiceArrayItem = (subIdx, field) => {
    const arr = [...form.subServices];
    arr[subIdx][field] = [...arr[subIdx][field], ""];
    setForm({ ...form, subServices: arr });
  };

  const handleRemoveSubServiceArrayItem = (subIdx, field, idx) => {
    const arr = [...form.subServices];
    const subArr = [...arr[subIdx][field]];
    subArr.splice(idx, 1);
    arr[subIdx][field] = subArr;
    setForm({ ...form, subServices: arr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clean up arrays: remove empty strings/objects
    const payload = {
      ...form,
      features: form.features.filter(f => f && f.trim() !== ""),
      technologies: form.technologies.filter(t => t && t.trim() !== ""),
      benefits: form.benefits.filter(b => b && b.trim() !== ""),
      subServices: form.subServices
        .filter(s => s.name.trim() !== "" && s.description.trim() !== "")
        .map(s => ({
          ...s,
          features: (s.features || []).filter(f => f && f.trim() !== ""),
          technologies: (s.technologies || []).filter(t => t && t.trim() !== ""),
        })),
    };

    console.log("Submitting service:", payload);

    try {
      await axios.post("http://localhost:5000/api/services", payload);
      navigate("/services");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Add New Service</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Slug</label>
          <input name="slug" value={form.slug} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Tagline</label>
          <input name="tagline" value={form.tagline} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        {/* Features */}
        <div>
          <label className="block font-medium mb-1">Features</label>
          {form.features.map((feature, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input value={feature} onChange={e => handleArrayChange("features", idx, e.target.value)} className="flex-1 border rounded px-3 py-2" required />
              <button type="button" onClick={() => handleRemoveArrayItem("features", idx)} className="px-2 text-red-500">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => handleAddArrayItem("features")}
            className="text-blue-600 hover:underline text-sm">+ Add Feature</button>
        </div>
        {/* Technologies */}
        <div>
          <label className="block font-medium mb-1">Technologies</label>
          {form.technologies.map((tech, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input value={tech} onChange={e => handleArrayChange("technologies", idx, e.target.value)} className="flex-1 border rounded px-3 py-2" required />
              <button type="button" onClick={() => handleRemoveArrayItem("technologies", idx)} className="px-2 text-red-500">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => handleAddArrayItem("technologies")}
            className="text-blue-600 hover:underline text-sm">+ Add Technology</button>
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
        {/* Sub-Services */}
        <div>
          <label className="block font-medium mb-1">Sub-Services</label>
          {form.subServices.map((sub, subIdx) => (
            <div key={subIdx} className="border rounded p-4 mb-4 bg-gray-50">
              <div className="flex gap-2 mb-2 items-center">
                <input placeholder="Name" value={sub.name} onChange={e => handleSubServiceChange(subIdx, "name", e.target.value)} className="flex-1 border rounded px-3 py-2" required />
                <input placeholder="Description" value={sub.description} onChange={e => handleSubServiceChange(subIdx, "description", e.target.value)} className="flex-1 border rounded px-3 py-2" required />
                <button type="button" onClick={() => handleRemoveSubService(subIdx)} className="px-2 text-red-500">&times;</button>
              </div>
              {/* Sub-service Features */}
              <div className="mb-2">
                <label className="block font-medium mb-1">Features</label>
                {sub.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input value={feature} onChange={e => handleSubServiceArrayChange(subIdx, "features", idx, e.target.value)} className="flex-1 border rounded px-3 py-2" required />
                    <button type="button" onClick={() => handleRemoveSubServiceArrayItem(subIdx, "features", idx)} className="px-2 text-red-500">&times;</button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddSubServiceArrayItem(subIdx, "features")}
                  className="text-blue-600 hover:underline text-sm">+ Add Feature</button>
              </div>
              {/* Sub-service Technologies */}
              <div>
                <label className="block font-medium mb-1">Technologies</label>
                {sub.technologies.map((tech, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input value={tech} onChange={e => handleSubServiceArrayChange(subIdx, "technologies", idx, e.target.value)} className="flex-1 border rounded px-3 py-2" required />
                    <button type="button" onClick={() => handleRemoveSubServiceArrayItem(subIdx, "technologies", idx)} className="px-2 text-red-500">&times;</button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddSubServiceArrayItem(subIdx, "technologies")}
                  className="text-blue-600 hover:underline text-sm">+ Add Technology</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddSubService}
            className="text-blue-600 hover:underline text-sm">+ Add Sub-Service</button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700" disabled={loading}>
            {loading ? "Saving..." : "Add Service"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicesAdd; 