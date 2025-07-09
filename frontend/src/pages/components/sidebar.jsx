import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FaHome, FaServicestack, FaBriefcase, FaInfoCircle, FaEnvelopeOpenText } from "react-icons/fa";

const Sidebar = () => {
  const [siteConfig, setSiteConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const API_BASE_URL = process.env.REACT_APP_BASE_URL || '';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/site-config`)
      .then(res => {
        setSiteConfig(res.data[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const navItems = [
    { to: "/", label: "Dashboard", icon: <FaHome /> },
    { to: "/services", label: "Services", icon: <FaServicestack /> },
    { to: "/careers", label: "Careers", icon: <FaBriefcase /> },
    { to: "/blogs", label: "Blogs", icon: <FaInfoCircle /> },
    { to: "/about", label: "About", icon: <FaInfoCircle /> },
    { to: "/contact-submissions", label: "Contact Submissions", icon: <FaEnvelopeOpenText /> },
  ];

  return (
    <div className="h-screen w-64 bg-white text-gray-800 flex flex-col shadow-sm border-r border-gray-100">
      {/* Branding Section */}
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <Link to="/" className="flex flex-col items-center gap-2 select-none">
          {loading ? (
            <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
          ) : siteConfig && siteConfig.logoUrl ? (
            <img src={siteConfig.logoUrl} alt="Logo" className="h-14 w-14 object-contain rounded-full border bg-white shadow-sm" />
          ) : (
            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">?</div>
          )}
          <span className="text-lg font-semibold text-gray-900 mt-2 truncate max-w-[12rem]">
            {loading ? "Loading..." : (siteConfig?.siteName || "Company")}
          </span>
        </Link>
      </div>
      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-4 mt-2 flex-1">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-base font-medium
              ${location.pathname === item.to ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"}
            `}
            style={{ minHeight: '44px' }}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
export default Sidebar;
