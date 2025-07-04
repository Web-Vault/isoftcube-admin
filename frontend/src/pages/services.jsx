import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Define API base URL from env
const API_BASE_URL = process.env.REACT_APP_BASE_URL || '';

const ViewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><title>View</title><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const DeleteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><title>Delete</title><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, service: null });
  const [deleting, setDeleting] = useState(false);

  const fetchServices = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/services`)
      .then(res => {
        setServices(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.service) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/services/${deleteModal.service._id}`);
      setDeleteModal({ open: false, service: null });
      fetchServices();
    } catch (err) {
      alert("Failed to delete service: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-10">Loading services...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Our Services</h1>
        <Link
          to="/services/add"
          className="px-5 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          + Add New Service
        </Link>
      </div>
      {services.length === 0 ? (
        <p className="text-gray-700">No services found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {services.map(service => (
            <div
              key={service._id}
              className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-blue-500 mb-1">{service.title || service.name}</h2>
                <p className="text-gray-600 mb-0 line-clamp-2">{service.shortDescription || service.description || service.fullDescription}</p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0 md:ml-4 shrink-0 self-end md:self-center">
                <Link
                  to={`/services/${service._id}`}
                  className="p-2 rounded hover:bg-blue-100 text-blue-600 transition"
                  title="View"
                >
                  <ViewIcon />
                </Link>
                <button
                  className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                  title="Delete"
                  onClick={() => setDeleteModal({ open: true, service })}
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, service: null })} title="Delete Service">
        <div className="mb-4 text-gray-700">Are you sure you want to delete <span className="font-bold">{deleteModal.service?.title || deleteModal.service?.name}</span>? This action cannot be undone.</div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setDeleteModal({ open: false, service: null })} disabled={deleting}>Cancel</button>
          <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</button>
        </div>
      </Modal>
    </div>
  );
};

export default Services; 