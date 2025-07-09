import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_URL || '';

const BlogAdd = () => {
  const [form, setForm] = useState({
    title: '',
    author: '',
    summary: '',
    coverImage: '',
    content: [],
  });
  const [section, setSection] = useState({ image: '', text: '' });
  const [addingSection, setAddingSection] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const [editingSectionIdx, setEditingSectionIdx] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSectionChange = e => {
    setSection({ ...section, [e.target.name]: e.target.value });
  };

  const addSection = () => {
    if (!section.text && !section.image) return;
    if (editingSectionIdx !== null) {
      // Edit existing section
      setForm(f => ({
        ...f,
        content: f.content.map((s, i) => i === editingSectionIdx ? section : s)
      }));
      setEditingSectionIdx(null);
    } else {
      // Add new section
      setForm(f => ({ ...f, content: [...f.content, section] }));
    }
    setSection({ image: '', text: '' });
    setAddingSection(false);
  };

  const editSection = idx => {
    setSection(form.content[idx]);
    setEditingSectionIdx(idx);
    setAddingSection(true);
  };

  const removeSection = idx => {
    setForm(f => ({ ...f, content: f.content.filter((_, i) => i !== idx) }));
    if (editingSectionIdx === idx) {
      setSection({ image: '', text: '' });
      setEditingSectionIdx(null);
      setAddingSection(false);
    }
  };

  // Generate slug from title
  const slug = form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/blogs`, { ...form, slug });
      navigate('/blogs');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Add Blog</h1>
      <div className="bg-white rounded-lg shadow p-8 border border-gray-200">
        {error && <div className="mb-4 px-4 py-2 rounded bg-red-100 text-red-800">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Title</label>
            <input type="text" name="title" className="border rounded px-3 py-2 w-full" value={form.title} onChange={handleChange} required disabled={saving} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Slug</label>
            <input type="text" name="slug" className="border rounded px-3 py-2 w-full bg-gray-100" placeholder="Auto-generated from title" value={slug} readOnly disabled />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Author</label>
            <input type="text" name="author" className="border rounded px-3 py-2 w-full" value={form.author} onChange={handleChange} required disabled={saving} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Summary</label>
            <textarea name="summary" className="border rounded px-3 py-2 w-full min-h-[60px]" value={form.summary} onChange={handleChange} disabled={saving} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Cover Image URL</label>
            <input type="text" name="coverImage" className="border rounded px-3 py-2 w-full" value={form.coverImage} onChange={handleChange} disabled={saving} />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Content Sections</label>
            {form.content.length === 0 && <div className="text-gray-500 mb-2">No sections added yet.</div>}
            <div className="flex flex-col gap-4 mb-4">
              {form.content.map((sec, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-4 flex flex-col relative">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button type="button" className="text-blue-500 hover:text-blue-700 mr-2" onClick={() => editSection(idx)} title="Edit Section">✎</button>
                    <button type="button" className="text-red-500 hover:text-red-700" onClick={() => removeSection(idx)} title="Remove Section">&times;</button>
                  </div>
                  {sec.image && <img src={sec.image} alt="Section" className="w-full max-h-40 object-cover rounded mb-2" />}
                  {sec.text && <div className="text-gray-700 whitespace-pre-line">{sec.text}</div>}
                </div>
              ))}
            </div>
            {addingSection ? (
              <div className="bg-gray-50 border border-blue-200 rounded p-4 mb-2 flex flex-col gap-2">
                <input type="text" name="image" placeholder="Section Image URL (optional)" className="border rounded px-3 py-2" value={section.image} onChange={handleSectionChange} disabled={saving} />
                <textarea name="text" placeholder="Section Text" className="border rounded px-3 py-2 min-h-[60px]" value={section.text} onChange={handleSectionChange} disabled={saving} />
                <div className="flex gap-2 justify-end">
                  <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setAddingSection(false); setSection({ image: '', text: '' }); setEditingSectionIdx(null); }} disabled={saving}>Cancel</button>
                  <button type="button" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={addSection} disabled={saving || (!section.text && !section.image)}>{editingSectionIdx !== null ? 'Save Section' : 'Add Section'}</button>
                </div>
              </div>
            ) : (
              <button type="button" className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200" onClick={() => { setAddingSection(true); setSection({ image: '', text: '' }); setEditingSectionIdx(null); }} disabled={saving}>+ Add Section</button>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? "Saving..." : "Save Blog"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogAdd; 