import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_BASE_URL || '';

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

const JobApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyModal, setReplyModal] = useState({ open: false, application: null });
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    // Fetch job details
    axios.get(`${API_BASE_URL}/api/jobs/${jobId}`)
      .then(res => setJob(res.data))
      .catch(() => setJob(null));
    // Fetch applications for this job
    axios.get(`${API_BASE_URL}/api/jobs/${jobId}/applications`)
      .then(res => {
        setApplications(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [jobId]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleSendReply = async () => {
    if (!replyModal.application || !replyText.trim()) return;
    setSending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await axios.post(`${API_BASE_URL}/api/jobs/applications/${replyModal.application._id}/reply`, { reply: replyText });
      // Update the application in the local state
      setApplications(applications => applications.map(app =>
        app._id === replyModal.application._id
          ? { ...app, reply: replyText, replied: true }
          : app
      ));
      setSuccessMsg("Reply sent successfully.");
      setReplyModal({ open: false, application: null });
      setReplyText("");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  // Split applications into non-replied and replied
  const nonRepliedApps = applications.filter(app => !app.replied);
  const repliedApps = applications.filter(app => app.replied);

  if (loading) return <div className="p-10">Loading applications...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="p-10 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-blue-800">
          Applications for: <span className="text-blue-600">{job ? job.title : 'Job'}</span>
        </h1>
        <Link
          to="/careers"
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
        >
          &larr; Back to Careers
        </Link>
      </div>
      {nonRepliedApps.length === 0 ? (
        <div className="text-gray-700">No new applications found for this job.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {nonRepliedApps.map(app => (
            <div key={app._id} className="bg-white p-6 rounded-lg shadow flex flex-col gap-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-blue-700 text-lg">{app.name}</div>
                  {app.jobId && app.jobId.title && (
                    <div className="text-base font-semibold text-blue-600 mb-1">{app.jobId.title}</div>
                  )}
                  <div className="text-gray-600">{app.email} {app.phone && <span className="ml-2">| {app.phone}</span>}</div>
                </div>
                <div className="text-sm text-gray-500 mt-2 md:mt-0">Applied: {new Date(app.appliedAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {app.replied && <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Replied</span>}
              </div>
              <div className="text-gray-700"><b>Experience:</b> {app.experience || <span className="italic text-gray-400">N/A</span>}</div>
              {app.resumeUrl && (
                <div><a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Resume</a></div>
              )}
              <div className="text-gray-700"><b>Cover Letter:</b> <span className="whitespace-pre-line">{app.coverLetter || <span className="italic text-gray-400">N/A</span>}</span></div>
              {app.replied && app.reply && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <b>Reply:</b>
                  <div className="whitespace-pre-line text-gray-800">{app.reply}</div>
                </div>
              )}
              {!app.replied && (
                <button
                  className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-max"
                  onClick={() => setReplyModal({ open: true, application: app })}
                >
                  Reply
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {repliedApps.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-green-700 mb-4">Replied Applications</h2>
          <div className="flex flex-col gap-6">
            {repliedApps.map(app => (
              <div key={app._id} className="bg-white p-6 rounded-lg shadow flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-blue-700 text-lg">{app.name}</div>
                    {app.jobId && app.jobId.title && (
                      <div className="text-base font-semibold text-blue-600 mb-1">{app.jobId.title}</div>
                    )}
                    <div className="text-gray-600">{app.email} {app.phone && <span className="ml-2">| {app.phone}</span>}</div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2 md:mt-0">Applied: {new Date(app.appliedAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {app.replied && <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Replied</span>}
                </div>
                <div className="text-gray-700"><b>Experience:</b> {app.experience || <span className="italic text-gray-400">N/A</span>}</div>
                {app.resumeUrl && (
                  <div><a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Resume</a></div>
                )}
                <div className="text-gray-700"><b>Cover Letter:</b> <span className="whitespace-pre-line">{app.coverLetter || <span className="italic text-gray-400">N/A</span>}</span></div>
                {app.replied && app.reply && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                    <b>Reply:</b>
                    <div className="whitespace-pre-line text-gray-800">{app.reply}</div>
                  </div>
                )}
                {!app.replied && (
                  <button
                    className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-max"
                    onClick={() => setReplyModal({ open: true, application: app })}
                  >
                    Reply
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal open={replyModal.open} onClose={() => { setReplyModal({ open: false, application: null }); setReplyText(""); }} title={replyModal.application ? `Reply to ${replyModal.application.name}` : "Reply"}>
        {errorMsg && <div className="mb-2 text-red-600">{errorMsg}</div>}
        <textarea
          className="w-full border rounded p-2 mb-4 min-h-[100px]"
          placeholder="Type your reply here..."
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          disabled={sending}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => { setReplyModal({ open: false, application: null }); setReplyText(""); }}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSendReply}
            disabled={sending || !replyText.trim()}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </Modal>
      {successMsg && <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">{successMsg}</div>}
    </div>
  );
};

export default JobApplications; 