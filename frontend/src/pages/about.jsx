import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const SectionCard = ({ title, children, onEdit }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-6 relative">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-semibold text-blue-700">{title}</h2>
      {onEdit && (
        <button onClick={onEdit} className="text-blue-500 hover:text-blue-700 p-2 rounded-full transition-colors" aria-label={`Edit ${title}`}>
          <FaEdit />
        </button>
      )}
    </div>
    {children}
  </div>
);

const About = () => {
  const [about, setAbout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, type: null, idx: null, fields: {} });
  const [addModal, setAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, idx: null, name: '' });
  const [deleteValueConfirm, setDeleteValueConfirm] = useState({ open: false, idx: null, title: '' });
  const [addValueModal, setAddValueModal] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/about")
      .then(res => {
        setAbout(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10">Loading about page...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  const aboutData = about[0];

  // Helper to get AboutPage ID
  const aboutId = aboutData?._id;

  // Modal for editing individual section, value, or team member
  const renderModal = () => {
    if (!modal.open) return null;
    let title = "Edit";
    let fields = modal.fields;
    let onChange = (key, value) => setModal(m => ({ ...m, fields: { ...m.fields, [key]: value } }));
    let formFields = null;

    if (modal.type === "section") {
      title = "Edit Section";
      formFields = (
        <>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Title</label>
            <input
              className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300"
              value={fields.title}
              onChange={e => onChange("title", e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Content</label>
            <textarea
              className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300"
              value={fields.content}
              onChange={e => onChange("content", e.target.value)}
              rows={8}
              required
            />
          </div>
        </>
      );
    } else if (modal.type === "value") {
      title = "Edit Value";
      formFields = (
        <>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Title</label>
            <input
              className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300"
              value={fields.title}
              onChange={e => onChange("title", e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Content</label>
            <textarea
              className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300"
              value={fields.content}
              onChange={e => onChange("content", e.target.value)}
              rows={8}
              required
            />
          </div>
        </>
      );
    } else if (modal.type === "member") {
      title = "Edit Team Member";
      formFields = (
        <>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Name</label>
            <input
              className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300"
              value={fields.name}
              onChange={e => onChange("name", e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Role</label>
            <input
              className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300"
              value={fields.role}
              onChange={e => onChange("role", e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Bio</label>
            <textarea
              className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300"
              value={fields.bio}
              onChange={e => onChange("bio", e.target.value)}
              rows={6}
            />
          </div>
        </>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-10 min-w-[400px] max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">{title}</h3>
            <button onClick={() => setModal({ open: false, type: null, idx: null, fields: {} })} className="text-gray-400 hover:text-gray-700 text-3xl">&times;</button>
          </div>
          <form onSubmit={async e => {
            e.preventDefault();
            if (modal.type === "section" && aboutId != null && modal.idx != null) {
              // PATCH to backend
              const res = await axios.patch(`http://localhost:5000/api/about/${aboutId}/section/${modal.idx}`, {
                title: fields.title,
                content: fields.content
              });
              setAbout([res.data]);
            } else if (modal.type === "member" && aboutId != null && modal.idx != null) {
              // PATCH to backend
              const res = await axios.patch(`http://localhost:5000/api/about/${aboutId}/member/${modal.idx}`, {
                name: fields.name,
                role: fields.role,
                bio: fields.bio
              });
              setAbout([res.data]);
            } else if (modal.type === "value" && aboutId != null && modal.idx != null) {
              // PATCH to backend
              const res = await axios.patch(`http://localhost:5000/api/about/${aboutId}/value/${modal.idx}`, {
                title: fields.title,
                content: fields.content
              });
              setAbout([res.data]);
            } else {
              // Local update for other types (values, members)
              setAbout(prev => {
                const updated = [...prev];
                if (updated[0]) {
                  if (modal.type === "value" && updated[0].ourValues && modal.idx !== null) {
                    updated[0] = { ...updated[0] };
                    updated[0].ourValues = [...updated[0].ourValues];
                    updated[0].ourValues[modal.idx] = {
                      ...updated[0].ourValues[modal.idx],
                      title: fields.title,
                      content: fields.content
                    };
                  } else if (modal.type === "member" && updated[0].teamMembers && modal.idx !== null) {
                    updated[0] = { ...updated[0] };
                    updated[0].teamMembers = [...updated[0].teamMembers];
                    updated[0].teamMembers[modal.idx] = {
                      ...updated[0].teamMembers[modal.idx],
                      name: fields.name,
                      role: fields.role,
                      bio: fields.bio
                    };
                  }
                }
                return updated;
              });
            }
            setModal({ open: false, type: null, idx: null, fields: {} });
          }}>
            {formFields}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal({ open: false, type: null, idx: null, fields: {} })} className="px-6 py-3 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-lg">Cancel</button>
              <button type="submit" className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 text-lg">Save</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal for adding a new section
  const renderAddModal = () => (
    addModal && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-10 min-w-[400px] max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Add Section</h3>
            <button onClick={() => setAddModal(false)} className="text-gray-400 hover:text-gray-700 text-3xl">&times;</button>
          </div>
          <form onSubmit={async e => {
            e.preventDefault();
            if (aboutId) {
              const res = await axios.post(`http://localhost:5000/api/about/${aboutId}/section`, {
                title: e.target.title.value,
                content: e.target.content.value
              });
              setAbout([res.data]);
            }
            setAddModal(false);
          }}>
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Title</label>
              <input name="title" className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300" required />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Content</label>
              <textarea name="content" className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300" rows={8} required />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setAddModal(false)} className="px-6 py-3 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-lg">Cancel</button>
              <button type="submit" className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 text-lg">Add</button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  // Modal for adding a new team member
  const renderAddMemberModal = () => (
    addModal === 'member' && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-10 min-w-[400px] max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Add Team Member</h3>
            <button onClick={() => setAddModal(false)} className="text-gray-400 hover:text-gray-700 text-3xl">&times;</button>
          </div>
          <form onSubmit={async e => {
            e.preventDefault();
            if (aboutId) {
              const res = await axios.post(`http://localhost:5000/api/about/${aboutId}/member`, {
                name: e.target.name.value,
                role: e.target.role.value,
                bio: e.target.bio.value
              });
              setAbout([res.data]);
            }
            setAddModal(false);
          }}>
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Name</label>
              <input name="name" className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300" required />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Role</label>
              <input name="role" className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300" required />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Bio</label>
              <textarea name="bio" className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300" rows={6} />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setAddModal(false)} className="px-6 py-3 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-lg">Cancel</button>
              <button type="submit" className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 text-lg">Add</button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  // Modal for delete confirmation
  const renderDeleteConfirmModal = () => (
    deleteConfirm.open && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Delete Team Member</h3>
          <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{deleteConfirm.name}</span> from the team?</p>
          <div className="flex justify-end gap-3">
            <button
              className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-lg"
              onClick={() => setDeleteConfirm({ open: false, idx: null, name: '' })}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-lg"
              onClick={async () => {
                if (aboutId != null && deleteConfirm.idx !== null) {
                  const res = await axios.delete(`http://localhost:5000/api/about/${aboutId}/member/${deleteConfirm.idx}`);
                  setAbout([res.data]);
                }
                setDeleteConfirm({ open: false, idx: null, name: '' });
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Modal for delete value confirmation
  const renderDeleteValueConfirmModal = () => (
    deleteValueConfirm.open && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Delete Value</h3>
          <p className="mb-6">Are you sure you want to delete the value <span className="font-semibold">{deleteValueConfirm.title}</span>?</p>
          <div className="flex justify-end gap-3">
            <button
              className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-lg"
              onClick={() => setDeleteValueConfirm({ open: false, idx: null, title: '' })}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-lg"
              onClick={async () => {
                if (aboutId != null && deleteValueConfirm.idx !== null) {
                  const res = await axios.delete(`http://localhost:5000/api/about/${aboutId}/value/${deleteValueConfirm.idx}`);
                  setAbout([res.data]);
                }
                setDeleteValueConfirm({ open: false, idx: null, title: '' });
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Modal for adding a new value
  const renderAddValueModal = () => (
    addValueModal && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-10 min-w-[400px] max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Add Value</h3>
            <button onClick={() => setAddValueModal(false)} className="text-gray-400 hover:text-gray-700 text-3xl">&times;</button>
          </div>
          <form onSubmit={async e => {
            e.preventDefault();
            if (aboutId) {
              const res = await axios.post(`http://localhost:5000/api/about/${aboutId}/value`, {
                title: e.target.title.value,
                content: e.target.content.value
              });
              setAbout([res.data]);
            }
            setAddValueModal(false);
          }}>
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Title</label>
              <input name="title" className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300" required />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">Content</label>
              <textarea name="content" className="w-full border rounded px-4 py-3 text-lg focus:outline-none focus:ring focus:border-blue-300" rows={6} required />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setAddValueModal(false)} className="px-6 py-3 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-lg">Cancel</button>
              <button type="submit" className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 text-lg">Add</button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  return (
    <div className="md:p-10 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">About Us</h1>
      {!aboutData ? (
        <p className="text-gray-700">No about page data found.</p>
      ) : (
        <div className="space-y-8">
          {/* Sections (Mission, Vision, etc.) */}
          {aboutData.sections && aboutData.sections.length > 0 && (
            <SectionCard title="Our Mission & Vision">
              <div className="grid gap-4 md:grid-cols-2">
                {aboutData.sections.map((section, idx) => (
                  <div key={idx} className="mb-2 bg-blue-50 rounded p-4 relative">
                    <button
                      className="absolute top-2 right-10 text-red-500 hover:text-red-700 p-1 rounded-full"
                      aria-label={`Delete ${section.title}`}
                      onClick={async () => {
                        if (aboutId != null) {
                          const res = await axios.delete(`http://localhost:5000/api/about/${aboutId}/section/${idx}`);
                          setAbout([res.data]);
                        }
                      }}
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 p-1 rounded-full"
                      aria-label={`Edit ${section.title}`}
                      onClick={() => setModal({ open: true, type: "section", idx, fields: { title: section.title, content: section.content || section.description || '' } })}
                    >
                      <FaEdit />
                    </button>
                    <h3 className="text-lg font-semibold text-blue-600 mb-1">{section.title}</h3>
                    <p className="text-gray-700">{section.content || section.description || "No content available."}</p>
                  </div>
                ))}
              </div>
              <button
                className="flex items-center gap-2 mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                onClick={() => setAddModal(true)}
              >
                <FaPlus /> Add Section
              </button>
            </SectionCard>
          )}

          {/* Our Values */}
          {aboutData.ourValues && aboutData.ourValues.length > 0 && (
            <SectionCard title="Our Values">
              <ul className="grid gap-3 md:grid-cols-2">
                {aboutData.ourValues.map((value, idx) => (
                  <li key={idx} className="bg-blue-50 rounded p-3 relative">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-blue-700 text-base">{value.title}</span>
                      <div className="flex gap-2 ml-2">
                        <button
                          className="text-blue-500 hover:text-blue-700 p-1 rounded-full"
                          aria-label={`Edit ${value.title}`}
                          onClick={() => setModal({ open: true, type: "value", idx, fields: { title: value.title, content: value.content || value.description || '' } })}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 p-1 rounded-full"
                          aria-label={`Delete ${value.title}`}
                          onClick={() => setDeleteValueConfirm({ open: true, idx, title: value.title })}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-700 text-sm">{value.content || value.description}</div>
                  </li>
                ))}
              </ul>
              <button
                className="flex items-center gap-2 mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                onClick={() => setAddValueModal(true)}
              >
                <FaPlus /> Add Value
              </button>
            </SectionCard>
          )}

          {/* Team Members */}
          {aboutData.teamMembers && aboutData.teamMembers.length > 0 ? (
            <SectionCard title="Our Team">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aboutData.teamMembers.map((member, idx) => (
                  <li key={idx} className="bg-blue-50 p-3 rounded relative">
                    <button
                      className="absolute top-2 right-10 text-red-500 hover:text-red-700 p-1 rounded-full"
                      aria-label={`Delete ${member.name}`}
                      onClick={() => setDeleteConfirm({ open: true, idx, name: member.name })}
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 p-1 rounded-full"
                      aria-label={`Edit ${member.name}`}
                      onClick={() => setModal({ open: true, type: "member", idx, fields: { name: member.name, role: member.role, bio: member.bio || '' } })}
                    >
                      <FaEdit />
                    </button>
                    <div className="font-semibold text-blue-700">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.role}</div>
                    {member.bio && <div className="text-gray-600 mt-1">{member.bio}</div>}
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : (
            <div className="text-gray-500 mb-4">No team members yet.</div>
          )}
          <button
            className="flex items-center gap-2 mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            onClick={() => setAddModal('member')}
          >
            <FaPlus /> Add Team Member
          </button>
        </div>
      )}
      {renderModal()}
      {renderAddModal()}
      {renderAddMemberModal()}
      {renderDeleteConfirmModal()}
      {renderDeleteValueConfirmModal()}
      {renderAddValueModal()}
    </div>
  );
};

export default About; 