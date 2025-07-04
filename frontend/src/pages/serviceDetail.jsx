import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

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

const SectionCard = ({ title, children, onEdit, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-6 mb-6 w-full ${className}`}>
    <div className="flex items-center mb-3">
      <div className="text-lg font-semibold text-blue-500 flex-1">{title}</div>
      {onEdit && <EditIcon onClick={onEdit} />}
    </div>
    {children}
  </div>
);

const TwoColSection = ({ leftTitle, leftList, rightTitle, rightList, onEditLeft, onEditRight }) => (
  <div className="flex flex-col md:flex-row gap-4">
    <div className="flex-1">
      <div className="flex items-center mb-1">
        <div className="font-medium text-blue-500">{leftTitle}</div>
        {onEditLeft && <EditIcon onClick={onEditLeft} />}
      </div>
      {leftList && leftList.length > 0 ? (
        <ul className="list-disc list-inside text-gray-700 text-sm">
          {leftList.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      ) : <div className="text-gray-400 text-sm">No {leftTitle.toLowerCase()} listed.</div>}
    </div>
    <div className="flex-1">
      <div className="flex items-center mb-1">
        <div className="font-medium text-blue-500">{rightTitle}</div>
        {onEditRight && <EditIcon onClick={onEditRight} />}
      </div>
      {rightList && rightList.length > 0 ? (
        <ul className="list-disc list-inside text-gray-700 text-sm">
          {rightList.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      ) : <div className="text-gray-400 text-sm">No {rightTitle.toLowerCase()} listed.</div>}
    </div>
  </div>
);

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, field: null, subIdx: null });
  const [editValue, setEditValue] = useState("");
  const [editArray, setEditArray] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchService = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/services/${id}`);
      setService(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
    // eslint-disable-next-line
  }, [id]);

  // Open modal for text field
  const openTextModal = (field, value, subIdx = null) => {
    setEditValue(value || "");
    setModal({ open: true, field, subIdx });
  };
  // Open modal for array field
  const openArrayModal = (field, arr, subIdx = null) => {
    setEditArray(arr ? [...arr] : []);
    setEditValue("");
    setModal({ open: true, field, subIdx });
  };

  // Save handler
  const handleModalSave = async (e) => {
    e.preventDefault();
    if (!service) return;
    setSaving(true);
    try {
      let update = {};
      if (modal.subIdx === null) {
        // Main service
        if (["title", "slug", "shortDescription", "fullDescription", "description"].includes(modal.field)) {
          update[modal.field] = editValue;
        } else {
          update[modal.field] = editArray;
        }
        await axios.put(`http://localhost:5000/api/services/${service._id}`, update);
      } else {
        // Sub-service
        const subServices = [...service.subServices];
        if (["name", "description"].includes(modal.field)) {
          subServices[modal.subIdx][modal.field] = editValue;
        } else {
          subServices[modal.subIdx][modal.field] = editArray;
        }
        await axios.put(`http://localhost:5000/api/services/${service._id}`, { subServices });
      }
      setModal({ open: false, field: null, subIdx: null });
      setEditValue("");
      setEditArray([]);
      fetchService();
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Modal content
  const renderModalContent = () => {
    if (["title", "slug", "shortDescription", "fullDescription", "description", "name"].includes(modal.field)) {
      return (
        <form onSubmit={handleModalSave} className="flex flex-col gap-4">
          <input
            type="text"
            className="border rounded px-3 py-2"
            value={editValue || ""}
            onChange={e => setEditValue(e.target.value)}
            disabled={saving}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setModal({ open: false, field: null, subIdx: null })} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      );
    } else if (modal.field && Array.isArray(editArray)) {
      // Array field
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
              placeholder={`Add new ${modal.field ? modal.field.slice(0, -1) : ''}`}
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
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setModal({ open: false, field: null, subIdx: null })} disabled={saving}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      );
    } else {
      return null;
    }
  };

  if (loading) return <div className="p-10">Loading service...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;
  if (!service) return <div className="p-10">Service not found.</div>;

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <Link to="/services" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Services</Link>
      <div className="flex flex-col gap-6">
        <SectionCard title="Service Name" onEdit={() => openTextModal("title", service.title)}>
          <div className="text-xl font-bold text-gray-800">{service.title || service.name}</div>
        </SectionCard>
        <SectionCard title="Slug" onEdit={() => openTextModal("slug", service.slug)}>
          <div className="text-gray-600">{service.slug}</div>
        </SectionCard>
        <SectionCard title="Tagline" onEdit={() => openTextModal("shortDescription", service.shortDescription)}>
          <div className="text-gray-600">{service.shortDescription}</div>
        </SectionCard>
        <SectionCard title="Description" onEdit={() => openTextModal("fullDescription", service.fullDescription || service.description)}>
          <div className="text-gray-700 whitespace-pre-line text-base">{service.fullDescription || service.description}</div>
        </SectionCard>
        <SectionCard title="Features & Technologies" className="p-4">
          <TwoColSection
            leftTitle="Features"
            leftList={service.features}
            rightTitle="Technologies"
            rightList={service.technologies}
            onEditLeft={() => openArrayModal("features", service.features)}
            onEditRight={() => openArrayModal("technologies", service.technologies)}
          />
        </SectionCard>
        <SectionCard title="Benefits" onEdit={() => openArrayModal("benefits", service.benefits)}>
          {service.benefits && service.benefits.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700 text-sm">
              {service.benefits.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          ) : <div className="text-gray-400 text-sm">No benefits listed.</div>}
        </SectionCard>
        <SectionCard title="Sub-Services" onEdit={null}>
          {service.subServices && service.subServices.length > 0 ? (
            <div className="flex flex-col gap-4">
              {service.subServices.map((sub, i) => (
                <div key={i} className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center mb-2">
                    <div className="font-semibold text-blue-500 flex-1">{sub.name}</div>
                    <EditIcon onClick={() => openTextModal("name", sub.name, i)} />
                  </div>
                  <div className="text-gray-600 mb-2 text-sm">{sub.description} <EditIcon onClick={() => openTextModal("description", sub.description, i)} /></div>
                  <TwoColSection
                    leftTitle="Features"
                    leftList={sub.features}
                    rightTitle="Technologies"
                    rightList={sub.technologies}
                    onEditLeft={() => openArrayModal("features", sub.features, i)}
                    onEditRight={() => openArrayModal("technologies", sub.technologies, i)}
                  />
                </div>
              ))}
            </div>
          ) : <div className="text-gray-400 text-sm">No sub-services listed.</div>}
        </SectionCard>
      </div>
      <Modal open={modal.open} onClose={() => setModal({ open: false, field: null, subIdx: null })} title={`Edit ${modal.field ? modal.field.charAt(0).toUpperCase() + modal.field.slice(1) : ""}`}>{renderModalContent()}</Modal>
    </div>
  );
};

export default ServiceDetail; 