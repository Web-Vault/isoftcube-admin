import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./components/Modal.jsx";

const EditIcon = ({ onClick }) => (
  <button
    onClick={onClick}
    className="ml-2 p-1 rounded hover:bg-gray-200 focus:outline-none"
    title="Edit"
    type="button"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h12" />
    </svg>
  </button>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ jobs: 0, services: 0, siteConfig: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editCompany, setEditCompany] = useState({ name: "", logo: null, logoPreview: null });
  const [editEmails, setEditEmails] = useState({ list: [], newEmail: "" });
  const [editPhones, setEditPhones] = useState({ list: [], newPhone: "" });
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [teamMembersCount, setTeamMembersCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsRes, servicesRes, siteConfigRes, aboutRes] = await Promise.all([
          axios.get("http://localhost:5000/api/jobs"),
          axios.get("http://localhost:5000/api/services"),
          axios.get("http://localhost:5000/api/site-config"),
          axios.get("http://localhost:5000/api/about")
        ]);
        setStats({
          jobs: jobsRes.data.length,
          services: servicesRes.data.length,
          siteConfig: siteConfigRes.data[0] || null
        });
        const aboutData = aboutRes.data[0];
        setTeamMembersCount(aboutData && Array.isArray(aboutData.teamMembers) ? aboutData.teamMembers.length : 0);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10">Loading dashboard...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  const { jobs, services, siteConfig } = stats;

  // Helper to reset forms
  const resetCompanyForm = () => {
    if (stats.siteConfig) {
      setEditCompany({
        name: stats.siteConfig.siteName || "",
        logo: null,
        logoPreview: null,
      });
    } else {
      setEditCompany({ name: "", logo: null, logoPreview: null });
    }
  };
  const resetEmailsForm = () => {
    setEditEmails({
      list: stats.siteConfig?.contactEmails || [],
      newEmail: "",
    });
  };
  const resetPhonesForm = () => {
    setEditPhones({
      list: stats.siteConfig?.contactPhones || [],
      newPhone: "",
    });
  };
  const resetAddressForm = () => {
    setEditAddress(stats.siteConfig?.contactAddress || "");
  };

  // Open modals
  const openCompanyModal = () => {
    if (stats.siteConfig) {
      setEditCompany({
        name: stats.siteConfig.siteName || "",
        logo: null,
        logoPreview: null,
      });
    }
    setEditModal("company");
  };
  const openEmailsModal = () => {
    resetEmailsForm();
    setEditModal("emails");
  };
  const openPhonesModal = () => {
    resetPhonesForm();
    setEditModal("phones");
  };
  const openAddressModal = () => {
    resetAddressForm();
    setEditModal("address");
  };

  // Save handlers
  const handleCompanySave = async (e) => {
    e.preventDefault();
    if (!stats.siteConfig) return;
    setSaving(true);
    try {
      let logoUrl = stats.siteConfig.logoUrl;
      // If a new logo is selected, upload it
      if (editCompany.logo) {
        // Simulate upload: in real app, you'd POST to an upload endpoint
        // For now, just use a local preview (or you can implement upload logic)
        // logoUrl = await uploadLogo(editCompany.logo);
        // We'll skip actual upload for now
        logoUrl = editCompany.logoPreview;
      }
      // Update site config
      await axios.put(`http://localhost:5000/api/site-config/${stats.siteConfig._id}`, {
        siteName: editCompany.name,
        logoUrl,
      });
      // Refresh dashboard data
      const [jobsRes, servicesRes, siteConfigRes] = await Promise.all([
        axios.get("http://localhost:5000/api/jobs"),
        axios.get("http://localhost:5000/api/services"),
        axios.get("http://localhost:5000/api/site-config")
      ]);
      setStats({
        jobs: jobsRes.data.length,
        services: servicesRes.data.length,
        siteConfig: siteConfigRes.data[0] || null
      });
      setEditModal(null);
      resetCompanyForm();
    } catch (err) {
      alert("Failed to update company info: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleEmailsSave = async (e) => {
    e.preventDefault();
    if (!stats.siteConfig) return;
    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/site-config/${stats.siteConfig._id}`, {
        contactEmails: editEmails.list,
      });
      // Refresh dashboard data
      const [jobsRes, servicesRes, siteConfigRes] = await Promise.all([
        axios.get("http://localhost:5000/api/jobs"),
        axios.get("http://localhost:5000/api/services"),
        axios.get("http://localhost:5000/api/site-config")
      ]);
      setStats({
        jobs: jobsRes.data.length,
        services: servicesRes.data.length,
        siteConfig: siteConfigRes.data[0] || null
      });
      setEditModal(null);
      resetEmailsForm();
    } catch (err) {
      alert("Failed to update emails: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  const handlePhonesSave = async (e) => {
    e.preventDefault();
    if (!stats.siteConfig) return;
    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/site-config/${stats.siteConfig._id}`, {
        contactPhones: editPhones.list,
      });
      // Refresh dashboard data
      const [jobsRes, servicesRes, siteConfigRes] = await Promise.all([
        axios.get("http://localhost:5000/api/jobs"),
        axios.get("http://localhost:5000/api/services"),
        axios.get("http://localhost:5000/api/site-config")
      ]);
      setStats({
        jobs: jobsRes.data.length,
        services: servicesRes.data.length,
        siteConfig: siteConfigRes.data[0] || null
      });
      setEditModal(null);
      resetPhonesForm();
    } catch (err) {
      alert("Failed to update phone numbers: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleAddressSave = async (e) => {
    e.preventDefault();
    if (!stats.siteConfig) return;
    setSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/site-config/${stats.siteConfig._id}`, {
        contactAddress: editAddress,
      });
      // Refresh dashboard data
      const [jobsRes, servicesRes, siteConfigRes] = await Promise.all([
        axios.get("http://localhost:5000/api/jobs"),
        axios.get("http://localhost:5000/api/services"),
        axios.get("http://localhost:5000/api/site-config")
      ]);
      setStats({
        jobs: jobsRes.data.length,
        services: servicesRes.data.length,
        siteConfig: siteConfigRes.data[0] || null
      });
      setEditModal(null);
      resetAddressForm();
    } catch (err) {
      alert("Failed to update address: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 w-full">
      {/* Dashboard Page Header */}
      <div className="w-full mb-8">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">This page shows company information, contact details, and live statistics for jobs and services.</p>
      </div>
      {/* Header: Logo + Name */}
      {siteConfig && (
        <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl shadow p-6 mb-8 gap-6 w-full">
          <div className="flex items-center gap-4">
            {siteConfig.logoUrl && (
              <img src={siteConfig.logoUrl} alt="Logo" className="h-20 w-20 object-contain rounded border bg-gray-50" />
            )}
            <div className="flex items-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-1">{siteConfig.siteName || 'Site Name'}</h2>
              <EditIcon onClick={openCompanyModal} />
            </div>
          </div>
        </div>
      )}
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-xl shadow text-center">
          <div className="text-4xl font-bold text-blue-700">{jobs}</div>
          <div className="text-gray-700 mt-2">Job Vacancies</div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl shadow text-center">
          <div className="text-4xl font-bold text-green-700">{services}</div>
          <div className="text-gray-700 mt-2">Services</div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-6 rounded-xl shadow text-center">
          <div className="text-4xl font-bold text-purple-700">{teamMembersCount}</div>
          <div className="text-gray-700 mt-2">Team Members</div>
        </div>
      </div>
      {/* Info Row: Emails & Phones */}
      {siteConfig && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center mb-2">
              <div className="font-semibold text-blue-500">Email(s)</div>
              <EditIcon onClick={openEmailsModal} />
            </div>
            {Array.isArray(siteConfig.contactEmails) && siteConfig.contactEmails.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700">
                {siteConfig.contactEmails.map((email, idx) => (
                  <li key={idx}>{email}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">N/A</div>
            )}
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center mb-2">
              <div className="font-semibold text-blue-500">Phone(s)</div>
              <EditIcon onClick={openPhonesModal} />
            </div>
            {Array.isArray(siteConfig.contactPhones) && siteConfig.contactPhones.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700">
                {siteConfig.contactPhones.map((phone, idx) => (
                  <li key={idx}>{phone}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">N/A</div>
            )}
          </div>
        </div>
      )}
      {/* Address Card */}
      {siteConfig && (
        <div className="bg-white p-6 rounded-xl shadow mb-8 w-full">
          <div className="flex items-center mb-2">
            <div className="font-semibold text-blue-500">Address</div>
            <EditIcon onClick={openAddressModal} />
          </div>
          <div className="text-gray-700">{siteConfig.contactAddress || 'N/A'}</div>
        </div>
      )}
      {/* Modal for editing company name and logo */}
      <Modal open={editModal === "company"} onClose={() => { setEditModal(null); resetCompanyForm(); }} title="Edit Company Name & Logo">
        <form className="flex flex-col gap-4" onSubmit={handleCompanySave}>
          <label className="block">
            <span className="text-gray-700 font-medium">Company Name</span>
            <input
              type="text"
              className="mt-1 block w-full border rounded px-3 py-2"
              value={editCompany.name}
              onChange={e => setEditCompany({ ...editCompany, name: e.target.value })}
              disabled={saving}
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Logo</span>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full"
              onChange={e => {
                const file = e.target.files[0];
                setEditCompany({
                  ...editCompany,
                  logo: file,
                  logoPreview: file ? URL.createObjectURL(file) : null,
                });
              }}
              disabled={saving}
            />
          </label>
          <div className="flex gap-4 justify-center">
            {siteConfig.logoUrl && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Current Logo</span>
                <img src={siteConfig.logoUrl} alt="Current Logo" className="h-16 w-16 object-contain rounded border bg-gray-50" />
              </div>
            )}
            {editCompany.logoPreview && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Preview</span>
                <img src={editCompany.logoPreview} alt="Logo Preview" className="h-16 w-16 object-contain rounded border bg-gray-50" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setEditModal(null); resetCompanyForm(); }} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
      {/* Emails Modal */}
      <Modal open={editModal === "emails"} onClose={() => { setEditModal(null); resetEmailsForm(); }} title="Edit Emails">
        <form className="flex flex-col gap-4" onSubmit={handleEmailsSave}>
          <div>
            <ul className="mb-2">
              {editEmails.list.map((email, idx) => (
                <li key={idx} className="flex items-center justify-between py-1">
                  <span>{email}</span>
                  <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => setEditEmails(e => ({ ...e, list: e.list.filter((_, i) => i !== idx) }))} disabled={saving}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="email"
                className="flex-1 border rounded px-3 py-2"
                placeholder="Add new email"
                value={editEmails.newEmail}
                onChange={e => setEditEmails(em => ({ ...em, newEmail: e.target.value }))}
                disabled={saving}
              />
              <button type="button" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving || !editEmails.newEmail}
                onClick={() => {
                  if (editEmails.newEmail && !editEmails.list.includes(editEmails.newEmail)) {
                    setEditEmails(e => ({ ...e, list: [...e.list, e.newEmail], newEmail: "" }));
                  }
                }}>
                Add
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setEditModal(null); resetEmailsForm(); }} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
      {/* Phones Modal */}
      <Modal open={editModal === "phones"} onClose={() => { setEditModal(null); resetPhonesForm(); }} title="Edit Phone Numbers">
        <form className="flex flex-col gap-4" onSubmit={handlePhonesSave}>
          <div>
            <ul className="mb-2">
              {editPhones.list.map((phone, idx) => (
                <li key={idx} className="flex items-center justify-between py-1">
                  <span>{phone}</span>
                  <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => setEditPhones(e => ({ ...e, list: e.list.filter((_, i) => i !== idx) }))} disabled={saving}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded px-3 py-2"
                placeholder="Add new phone number"
                value={editPhones.newPhone}
                onChange={e => setEditPhones(em => ({ ...em, newPhone: e.target.value }))}
                disabled={saving}
              />
              <button type="button" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving || !editPhones.newPhone}
                onClick={() => {
                  if (editPhones.newPhone && !editPhones.list.includes(editPhones.newPhone)) {
                    setEditPhones(e => ({ ...e, list: [...e.list, e.newPhone], newPhone: "" }));
                  }
                }}>
                Add
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setEditModal(null); resetPhonesForm(); }} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
      {/* Address Modal */}
      <Modal open={editModal === "address"} onClose={() => { setEditModal(null); resetAddressForm(); }} title="Edit Address">
        <form className="flex flex-col gap-4" onSubmit={handleAddressSave}>
          <label className="block">
            <span className="text-gray-700 font-medium">Address</span>
            <textarea
              className="mt-1 block w-full border rounded px-3 py-2"
              rows={3}
              value={editAddress}
              onChange={e => setEditAddress(e.target.value)}
              disabled={saving}
            />
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setEditModal(null); resetAddressForm(); }} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
