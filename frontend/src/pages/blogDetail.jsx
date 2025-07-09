import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_URL || '';

const EditIcon = ({ onClick }) => (
  <button
    onClick={onClick}
    className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
    title="Edit"
    type="button"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12" />
    </svg>
  </button>
);
const DeleteIcon = ({ onClick }) => (
  <button
    onClick={onClick}
    className="ml-2 p-1 rounded hover:bg-red-100 focus:outline-none"
    title="Delete"
    type="button"
  >
    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  </button>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {title && <div className="px-6 pt-6 pb-2 text-xl font-semibold text-gray-800">{title}</div>}
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
};

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, sectionIdx: null, field: null });
  const [editSection, setEditSection] = useState({ image: '', text: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, sectionIdx: null });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const [mainModal, setMainModal] = useState(false);
  const [mainEdit, setMainEdit] = useState({ title: '', author: '', summary: '', coverImage: '' });

  const fetchBlog = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/blogs/${id}`)
      .then(res => {
        setBlog(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBlog();
    // eslint-disable-next-line
  }, [id]);

  const openEditModal = (sectionIdx) => {
    setEditSection(blog.content[sectionIdx]);
    setModal({ open: true, sectionIdx, field: 'section' });
  };

  const handleEditChange = (e) => {
    setEditSection({ ...editSection, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedContent = [...blog.content];
      updatedContent[modal.sectionIdx] = { ...editSection };
      await axios.put(`${API_BASE_URL}/api/blogs/${blog._id}`, { content: updatedContent });
      setModal({ open: false, sectionIdx: null, field: null });
      fetchBlog();
    } catch (err) {
      alert('Failed to update section: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (sectionIdx) => {
    setDeleteModal({ open: true, sectionIdx });
  };

  const handleDeleteSection = async () => {
    setDeleting(true);
    try {
      const updatedContent = blog.content.filter((_, idx) => idx !== deleteModal.sectionIdx);
      await axios.put(`${API_BASE_URL}/api/blogs/${blog._id}`, { content: updatedContent });
      setDeleteModal({ open: false, sectionIdx: null });
      fetchBlog();
    } catch (err) {
      alert('Failed to delete section: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const openMainEditModal = () => {
    setMainEdit({
      title: blog.title || '',
      author: blog.author || '',
      summary: blog.summary || '',
      coverImage: blog.coverImage || '',
    });
    setMainModal(true);
  };

  const handleMainEditChange = (e) => {
    setMainEdit({ ...mainEdit, [e.target.name]: e.target.value });
  };

  const handleMainEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/api/blogs/${blog._id}`, mainEdit);
      setMainModal(false);
      fetchBlog();
    } catch (err) {
      alert('Failed to update blog: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Loading blog...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;
  if (!blog) return <div className="p-10">Blog not found.</div>;

  return (
    <div className="p-10 w-full mx-auto">
      <button className="mb-6 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => navigate(-1)}>&larr; Back</button>
      <div className="bg-white rounded-lg shadow p-8 mb-8 border border-gray-200 relative">
        <div className="absolute top-3 right-3 flex gap-2">
          <EditIcon onClick={openMainEditModal} />
        </div>
        <h1 className="text-4xl font-bold text-blue-800 mb-2">{blog.title}</h1>
        <div className="text-gray-500 text-sm mb-4">By {blog.author} &middot; {new Date(blog.createdAt).toLocaleDateString()}</div>
        {blog.coverImage && (
          <img src={blog.coverImage} alt="Cover" className="w-full max-h-96 object-cover rounded mb-6" />
        )}
        {blog.summary && <div className="mb-6 text-lg text-gray-700">{blog.summary}</div>}
      </div>
      <div className="flex flex-col gap-8">
        {blog.content && blog.content.length > 0 ? blog.content.map((section, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 relative">
            <div className="absolute top-3 right-3 flex gap-2">
              <EditIcon onClick={() => openEditModal(idx)} />
              <DeleteIcon onClick={() => openDeleteModal(idx)} />
            </div>
            {section.image && (
              <img src={section.image} alt={`Section ${idx + 1}`} className="w-full max-h-72 object-cover rounded mb-4" />
            )}
            {section.text && <div className="text-gray-800 text-base whitespace-pre-line">{section.text}</div>}
          </div>
        )) : <div className="text-gray-500">No content sections.</div>}
      </div>
      {/* Edit Section Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, sectionIdx: null, field: null })} title="Edit Section">
        <form onSubmit={handleEditSave} className="flex flex-col gap-4">
          <label className="text-gray-700 font-medium">Section Image URL</label>
          <input
            type="text"
            name="image"
            className="border rounded px-3 py-2"
            value={editSection.image || ''}
            onChange={handleEditChange}
            disabled={saving}
          />
          <label className="text-gray-700 font-medium">Section Text</label>
          <textarea
            name="text"
            className="border rounded px-3 py-2 min-h-[100px]"
            value={editSection.text || ''}
            onChange={handleEditChange}
            disabled={saving}
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setModal({ open: false, sectionIdx: null, field: null })} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
      {/* Delete Section Modal */}
      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, sectionIdx: null })} title="Delete Section">
        <div className="mb-4 text-gray-700">Are you sure you want to delete this section? This action cannot be undone.</div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setDeleteModal({ open: false, sectionIdx: null })} disabled={deleting}>Cancel</button>
          <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteSection} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</button>
        </div>
      </Modal>
      {/* Main Edit Modal */}
      <Modal open={mainModal} onClose={() => setMainModal(false)} title="Edit Blog Info">
        <form onSubmit={handleMainEditSave} className="flex flex-col gap-4">
          <label className="text-gray-700 font-medium">Title</label>
          <input
            type="text"
            name="title"
            className="border rounded px-3 py-2"
            value={mainEdit.title}
            onChange={handleMainEditChange}
            disabled={saving}
            required
          />
          <label className="text-gray-700 font-medium">Author</label>
          <input
            type="text"
            name="author"
            className="border rounded px-3 py-2"
            value={mainEdit.author}
            onChange={handleMainEditChange}
            disabled={saving}
            required
          />
          <label className="text-gray-700 font-medium">Summary</label>
          <textarea
            name="summary"
            className="border rounded px-3 py-2 min-h-[60px]"
            value={mainEdit.summary}
            onChange={handleMainEditChange}
            disabled={saving}
          />
          <label className="text-gray-700 font-medium">Cover Image URL</label>
          <input
            type="text"
            name="coverImage"
            className="border rounded px-3 py-2"
            value={mainEdit.coverImage}
            onChange={handleMainEditChange}
            disabled={saving}
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setMainModal(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BlogDetail; 