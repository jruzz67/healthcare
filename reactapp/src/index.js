import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://8080-bdecacfaeccfdbaddfafafdbcfadcccca.premiumproject.examly.io";

// Configure Axios base URL
axios.defaults.baseURL = BASE_URL;

export async function fetchPatients() {
  const res = await axios.get("/api/patients");
  return res.data;
}

export async function fetchDoctors() {
  const res = await axios.get("/api/doctors");
  return res.data;
}

export async function createAppointment(payload) {
  const res = await axios.post("/api/appointments", payload);
  return res.data;
}

export async function updateAppointmentStatus(appointmentId, status) {
  const res = await axios.patch(`/api/appointments/${appointmentId}/status`, { status });
  return res.data;
}

export async function fetchAppointmentsByPatient(patientId) {
  const res = await axios.get(`/api/appointments/patient/${patientId}`);
  return res.data;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
