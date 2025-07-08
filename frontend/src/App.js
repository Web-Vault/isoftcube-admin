import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard.jsx";
import Services from "./pages/services.jsx";
import ServiceDetail from "./pages/serviceDetail.jsx";
import Careers from "./pages/careers.jsx";
import CareerDetail from "./pages/careerDetail.jsx";
import About from "./pages/about.jsx";
import Sidebar from "./pages/components/sidebar.jsx";
import ServicesAdd from "./pages/servicesAdd";
import CareersAdd from "./pages/careersAdd";
import JobApplications from "./pages/JobApplications.jsx";
import ContactSubmissions from "./pages/ContactSubmissions.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-100">
        <aside className="fixed">
          <Sidebar />
        </aside>
        <main className="flex-1 ml-[300px]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:id" element={<CareerDetail />} />
            <Route path="/careers/:jobId/applications" element={<JobApplications />} />
            <Route path="/about" element={<About />} />
            <Route path="/services/add" element={<ServicesAdd />} />
            <Route path="/careers/add" element={<CareersAdd />} />
            <Route path="/contact-submissions" element={<ContactSubmissions />} /> 
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
