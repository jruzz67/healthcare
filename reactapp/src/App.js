// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import PatientAccess from "./components/PatientAccess";
import DoctorAccess from "./components/DoctorAccess";
import AppLayout from "./components/AppLayout"; // <-- Import the new layout

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Internal App Pages wrapped in the new Layout */}
        <Route 
          path="/app/patient" 
          element={<AppLayout><PatientAccess /></AppLayout>} 
        />
        <Route 
          path="/app/doctor" 
          element={<AppLayout><DoctorAccess /></AppLayout>} 
        />

        {/* Redirect any other path to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
