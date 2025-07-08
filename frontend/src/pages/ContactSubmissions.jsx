import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BASE_URL || '';

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyModal, setReplyModal] = useState({ open: false, submission: null });
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/contact-submissions`)
      .then(res => {
        setSubmissions(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const openReplyModal = (submission) => {
    setReplyModal({ open: true, submission });
    setReplyText("");
    setSuccess("");
  };

  const closeReplyModal = () => {
    setReplyModal({ open: false, submission: null });
    setReplyText("");
    setSuccess("");
  };

  const handleReplySend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await axios.post(`${API_BASE_URL}/api/contact-submissions/${replyModal.submission._id}/reply`, { reply: replyText });
      setSuccess("Reply sent successfully!");
      // Update UI
      setSubmissions(submissions => submissions.map(sub =>
        sub._id === replyModal.submission._id
          ? { ...sub, reply: replyText, replied: true }
          : sub
      ));
      setTimeout(() => {
        closeReplyModal();
      }, 1200);
    } catch (err) {
      setSuccess("Failed to send reply: " + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-10">Loading contact submissions...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="p-10 w-full">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Contact Form Submissions</h1>
      {submissions.length === 0 ? (
        <div className="text-gray-700">No contact submissions found.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {submissions.map(sub => (
            <div key={sub._id} className="bg-white p-6 rounded-lg shadow flex flex-col gap-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-blue-700 text-lg">{sub.name}</div>
                  <div className="text-gray-600">{sub.email}{sub.company && <span className="ml-2">| {sub.company}</span>}</div>
                  {sub.service && <div className="text-gray-500">Service: {sub.service}</div>}
                </div>
                <div className="text-sm text-gray-500 mt-2 md:mt-0">Submitted: {new Date(sub.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-gray-700 mt-2"><b>Message:</b> <span className="whitespace-pre-line">{sub.message}</span></div>
              {sub.replied ? (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-green-700 font-semibold">Replied</div>
                  <div className="text-gray-800 mt-1"><b>Reply:</b> <span className="whitespace-pre-line">{sub.reply}</span></div>
                </div>
              ) : (
                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-max"
                  onClick={() => openReplyModal(sub)}
                >
                  Reply
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Reply Modal */}
      {replyModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeReplyModal}>&times;</button>
            <h2 className="text-xl font-bold mb-2 text-blue-800">Reply to {replyModal.submission.name}</h2>
            <div className="mb-2 text-gray-700"><b>Email:</b> {replyModal.submission.email}</div>
            <textarea
              className="w-full border rounded p-2 mt-2 mb-4 min-h-[100px]"
              placeholder="Type your reply here..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              disabled={sending}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              onClick={handleReplySend}
              disabled={sending || !replyText.trim()}
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
            {success && <div className="mt-3 text-green-700">{success}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions; 