import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const SectionCard = ({ title, children, onEdit }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 w-full">
    <div className="flex items-center mb-2">
      <div className="text-lg font-semibold text-blue-500 flex-1">{title}</div>
      {onEdit && (
        <button
          className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
          title="Edit"
          type="button"
          onClick={onEdit}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
            />
          </svg>
        </button>
      )}
    </div>
    {children}
  </div>
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
        {title && <div className="px-6 pt-6 pb-2 text-xl font-semibold text-blue-500">{title}</div>}
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
};

const CareerDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, field: null });
  const [editValue, setEditValue] = useState("");
  const [editArray, setEditArray] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/jobs/${id}`)
      .then((res) => {
        setJob(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10">Loading job...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;
  if (!job) return <div className="p-10">Job not found.</div>;

  // Open modal for string field
  const openTextModal = (field, value) => {
    setEditValue(value || "");
    setEditArray([]);
    setModal({ open: true, field });
  };
  // Open modal for array field
  const openArrayModal = (field, arr) => {
    setEditArray(arr ? [...arr] : []);
    setEditValue("");
    setModal({ open: true, field });
  };

  // Save handler
  const handleModalSave = async (e) => {
    e.preventDefault();
    if (!job) return;
    setSaving(true);
    try {
      let update = {};
      if (["title", "department", "location", "type", "experience", "genderPreference", "salary", "postedDate", "description"].includes(modal.field)) {
        update[modal.field] = editValue;
      } else {
        update[modal.field] = editArray;
      }
      await axios.put(`http://localhost:5000/api/jobs/${job._id}`, update);
      setModal({ open: false, field: null });
      setEditValue("");
      setEditArray([]);
      // Refresh data
      const res = await axios.get(`http://localhost:5000/api/jobs/${job._id}`);
      setJob(res.data);
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Modal content
  const renderModalContent = () => {
    if (!modal.field) return null;
    const value = job[modal.field];
    if (["title", "department", "location", "type", "experience", "genderPreference", "salary", "postedDate"].includes(modal.field)) {
      return (
        <form onSubmit={handleModalSave} className="flex flex-col gap-4">
          <input
            type={modal.field === "postedDate" ? "date" : "text"}
            className="border rounded px-3 py-2"
            value={editValue || ""}
            onChange={e => setEditValue(e.target.value)}
            disabled={saving}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setModal({ open: false, field: null })} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      );
    } else if (modal.field === "description") {
      return (
        <form onSubmit={handleModalSave} className="flex flex-col gap-4">
          <textarea
            className="border rounded px-3 py-2 min-h-[100px]"
            value={editValue || ""}
            onChange={e => setEditValue(e.target.value)}
            disabled={saving}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setModal({ open: false, field: null })} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      );
    } else if (Array.isArray(value)) {
      return (
        <form onSubmit={handleModalSave} className="flex flex-col gap-4">
          <ul className="mb-2">
            {editArray.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between py-1">
                <span>{item}</span>
                <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => setEditArray(arr => arr.filter((_, i) => i !== idx))} disabled={saving}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2"
              placeholder={`Add new ${modal.field.slice(0, -1)}`}
              value={editValue || ""}
              onChange={e => setEditValue(e.target.value)}
              disabled={saving}
            />
            <button type="button" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving || !editValue}
              onClick={() => {
                if (editValue && !editArray.includes(editValue)) {
                  setEditArray(arr => [...arr, editValue]);
                  setEditValue("");
                }
              }}>
              Add
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setModal({ open: false, field: null })} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      );
    }
    return null;
  };

  return (
    <div className="p-8 w-full bg-gray-50 min-h-screen">
      <Link
        to="/careers"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to Careers
      </Link>
      <SectionCard title="Job Title" onEdit={() => openTextModal("title", job.title)}>
        <div className="text-xl font-bold text-gray-800">{job.title || <span className="text-gray-400">No title set</span>}</div>
      </SectionCard>
      {job.department && (
        <div className="bg-white rounded-lg shadow p-5 mb-4 flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Department icon */}
            <div>
              <div className="text-xs text-blue-500">Department</div>
              <div className="text-gray-700 font-medium">{job.department}</div>
            </div>
          </div>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
            title="Edit"
            type="button"
            onClick={() => openTextModal("department", job.department)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
              />
            </svg>
          </button>
        </div>
      )}
      {job.location && (
        <div className="bg-white rounded-lg shadow p-5 mb-4 flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Location icon */}
            <div>
              <div className="text-xs text-blue-500">Location</div>
              <div className="text-gray-700 font-medium">{job.location}</div>
            </div>
          </div>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
            title="Edit"
            type="button"
            onClick={() => openTextModal("location", job.location)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
              />
            </svg>
          </button>
        </div>
      )}
      {job.type && (
        <div className="bg-white rounded-lg shadow p-5 mb-4 flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Type icon */}
            <div>
              <div className="text-xs text-blue-500">Type</div>
              <div className="text-gray-700 font-medium">{job.type}</div>
            </div>
          </div>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
            title="Edit"
            type="button"
            onClick={() => openTextModal("type", job.type)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
              />
            </svg>
          </button>
        </div>
      )}
      {job.experience && (
        <div className="bg-white rounded-lg shadow p-5 mb-4 flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Experience icon */}
            <div>
              <div className="text-xs text-blue-500">Experience</div>
              <div className="text-gray-700 font-medium">{job.experience}</div>
            </div>
          </div>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
            title="Edit"
            type="button"
            onClick={() => openTextModal("experience", job.experience)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
              />
            </svg>
          </button>
        </div>
      )}
      {job.genderPreference && (
        <div className="bg-white rounded-lg shadow p-5 mb-4 flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Gender icon */}
            <div>
              <div className="text-xs text-blue-500">Gender Preference</div>
              <div className="text-gray-700 font-medium">
                {job.genderPreference}
              </div>
            </div>
          </div>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
            title="Edit"
            type="button"
            onClick={() => openTextModal("genderPreference", job.genderPreference)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
              />
            </svg>
          </button>
        </div>
      )}
      {job.salary && (
        <div className="bg-white rounded-lg shadow p-5 mb-4 flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Salary icon */}
            <div>
              <div className="text-xs text-blue-500">Salary</div>
              <div className="text-gray-700 font-medium">{job.salary}</div>
            </div>
          </div>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
            title="Edit"
            type="button"
            onClick={() => openTextModal("salary", job.salary)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
              />
            </svg>
          </button>
        </div>
      )}
      {job.postedDate && (
        <div className="bg-white rounded-lg shadow p-5 mb-4 flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Calendar icon */}
            <div>
              <div className="text-xs text-blue-500">Posted Date</div>
              <div className="text-gray-700 font-medium">
                {new Date(job.postedDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          <button
            className="ml-2 p-1 rounded hover:bg-gray-100 focus:outline-none"
            title="Edit"
            type="button"
            onClick={() => openTextModal("postedDate", new Date(job.postedDate).toISOString().slice(0, 10))}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12"
              />
            </svg>
          </button>
        </div>
      )}
      <SectionCard title="Description" onEdit={() => openTextModal("description", job.description)}>
        <div className="text-gray-700 whitespace-pre-line">{job.description || <span className="text-gray-400">No description set</span>}</div>
      </SectionCard>
      <SectionCard title="Requirements" onEdit={() => openArrayModal("requirements", job.requirements)}>
        <ul className="list-disc list-inside text-gray-700">
          {job.requirements && job.requirements.length > 0 ? job.requirements.map((req, i) => <li key={i}>{req}</li>) : <li className="text-gray-400">No requirements set</li>}
        </ul>
      </SectionCard>
      <SectionCard title="Responsibilities" onEdit={() => openArrayModal("responsibilities", job.responsibilities)}>
        <ul className="list-disc list-inside text-gray-700">
          {job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities.map((res, i) => <li key={i}>{res}</li>) : <li className="text-gray-400">No responsibilities set</li>}
        </ul>
      </SectionCard>
      <SectionCard title="Benefits" onEdit={() => openArrayModal("benefits", job.benefits)}>
        <ul className="list-disc list-inside text-gray-700">
          {job.benefits && job.benefits.length > 0 ? job.benefits.map((ben, i) => <li key={i}>{ben}</li>) : <li className="text-gray-400">No benefits set</li>}
        </ul>
      </SectionCard>
      <Modal open={modal.open} onClose={() => setModal({ open: false, field: null })} title={`Edit ${modal.field ? modal.field.charAt(0).toUpperCase() + modal.field.slice(1) : ""}`}>{renderModalContent()}</Modal>
    </div>
  );
};

export default CareerDetail;
