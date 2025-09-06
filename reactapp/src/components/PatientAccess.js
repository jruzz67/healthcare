// src/components/PatientAccess.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NewPatientModal from "./NewPatientModal";
import ReviewModal from "./ReviewModal";
import NotificationPopup from "./NotificationPopup";
import { Chatbot } from "./Chatbot";
import { FiUser, FiPlus, FiCalendar, FiEdit, FiTrash2, FiMessageSquare } from 'react-icons/fi';

// Helper component for status badges
const StatusBadge = ({ status }) => {
  const statusStyles = {
    REQUESTED: 'bg-yellow-100 text-yellow-800', APPROVED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800', CANCELLED: 'bg-red-100 text-red-800',
    RESCHEDULED: 'bg-purple-100 text-purple-800',
  };
  return <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100'}`}>{status}</span>;
};

const PatientAccess = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [futureAppointments, setFutureAppointments] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", email: "", phoneNumber: "", dateOfBirth: "" });
  const [newAppointment, setNewAppointment] = useState({ doctorId: "", date: "", time: "09:00", reason: "" });
  const [activeTab, setActiveTab] = useState("book");
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isChatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, dRes] = await Promise.all([axios.get("/api/patients"), axios.get("/api/doctors")]);
        setPatients(Array.isArray(pRes.data) ? pRes.data : []);
        setDoctors(Array.isArray(dRes.data) ? dRes.data : []);
      } catch (error) { console.error("Error loading data:", error); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchAppointmentsByPatient(selectedPatientId);
    } else {
      setPastAppointments([]);
      setFutureAppointments([]);
    }
  }, [selectedPatientId]);

  // --- THIS FUNCTION IS NOW FIXED ---
  const fetchAppointmentsByPatient = async (patientId) => {
    try {
      const res = await axios.get(`/api/appointments/patient/${patientId}`);
      const appointmentsData = res.data;

      // CRUCIAL FIX: Check if the response is an array before filtering
      if (Array.isArray(appointmentsData)) {
        const now = new Date();
        // Use the spread operator to avoid direct mutation issues with filter
        const past = [...appointmentsData].filter(a => new Date(`${a.appointmentDate}T${a.appointmentTime}`) < now);
        const future = [...appointmentsData].filter(a => new Date(`${a.appointmentDate}T${a.appointmentTime}`) >= now);
        
        setPastAppointments(past.sort((a, b) => new Date(`${b.appointmentDate}T${b.appointmentTime}`) - new Date(`${a.appointmentDate}T${a.appointmentTime}`)));
        setFutureAppointments(future.sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime}`) - new Date(`${b.appointmentDate}T${b.appointmentTime}`)));
      } else {
        // If API returns an object (e.g., {message: "..."}), reset to empty arrays
        setPastAppointments([]);
        setFutureAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Also reset on error to prevent crashes
      setPastAppointments([]);
      setFutureAppointments([]);
    }
  };
  
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/patients", newPatient);
      setShowNewForm(false);
      setNewPatient({ name: "", email: "", phoneNumber: "", dateOfBirth: "" });
      const { data } = await axios.get("/api/patients");
      setPatients(data || []);
      setPopupMessage("Patient created successfully!"); setShowPopup(true);
    } catch (error) { setPopupMessage("Error creating patient."); setShowPopup(true); }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setPopupMessage("Please select a patient first!"); setShowPopup(true);
      return;
    }
    try {
      await axios.post("/api/appointments", {
        patientId: parseInt(selectedPatientId), doctorId: parseInt(newAppointment.doctorId),
        appointmentDate: newAppointment.date, appointmentTime: newAppointment.time,
        reason: newAppointment.reason,
      });
      setNewAppointment({ doctorId: "", date: "", time: "09:00", reason: "" });
      fetchAppointmentsByPatient(selectedPatientId);
      setPopupMessage("Appointment booked successfully!"); setShowPopup(true);
      setActiveTab("upcoming");
    } catch (error) { setPopupMessage("Error booking appointment."); setShowPopup(true); }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await axios.patch(`/api/appointments/${appointmentId}/status`, { status: "CANCELLED" });
      fetchAppointmentsByPatient(selectedPatientId);
      setPopupMessage("Appointment cancelled."); setShowPopup(true);
    } catch (error) { setPopupMessage("Error cancelling appointment."); setShowPopup(true); }
  };
  
  const handleReviewSubmit = async (reviewData) => {
    try {
      const appointment = pastAppointments.find(a => a.id === reviewData.appointmentId);
      await axios.post("/api/reviews", {
        patientId: parseInt(selectedPatientId),
        doctorId: appointment.doctor.id,
        ...reviewData,
      });
      setShowReviewModal(null);
      fetchAppointmentsByPatient(selectedPatientId);
      setPopupMessage("Review submitted successfully!"); setShowPopup(true);
    } catch (error) { setPopupMessage("Error submitting review."); setShowPopup(true); }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="bg-white p-4 rounded-xl shadow-md border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
            <FiUser className="text-purple-600" size={20}/>
            <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full md:w-auto p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
                <option value="">Select Patient Profile</option>
                {patients.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
            </div>
            <button onClick={() => setShowNewForm(true)} className="flex items-center justify-center w-full md:w-auto gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
            <FiPlus /> New Patient Profile
            </button>
        </div>
        {selectedPatientId ? (
            <div className="bg-white rounded-xl shadow-md border">
            <div className="flex border-b">
                {['book', 'upcoming', 'history'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 font-semibold text-center transition-colors w-1/3 relative ${activeTab === tab ? 'text-purple-600' : 'text-gray-500 hover:text-purple-500'}`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" layoutId="underline" />}
                  </button>
                ))}
            </div>
            <div className="p-6">
                <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                    {activeTab === 'book' && (
                      <form onSubmit={handleCreateAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <h2 className="md:col-span-2 text-2xl font-bold text-gray-900">Request a New Appointment</h2>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label><select name="doctorId" value={newAppointment.doctorId} onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" required><option value="">Select a Doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label><input type="text" name="reason" value={newAppointment.reason} onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" name="date" value={newAppointment.date} onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})} min={new Date().toISOString().split("T")[0]} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" required /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><input type="time" name="time" value={newAppointment.time} onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg" required /></div>
                        <div className="md:col-span-2 text-right"><button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all">Book Appointment</button></div>
                      </form>
                    )}
                    {(activeTab === 'upcoming' || activeTab === 'history') && (
                      <ul className="space-y-4">
                        {(activeTab === 'upcoming' ? futureAppointments : pastAppointments).map(a => (
                          <li key={a.id} className="bg-gray-50 p-4 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">Dr. {a.doctor.name} <span className="text-sm font-normal text-gray-500">({a.doctor.specialization})</span></p>
                              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1"><FiCalendar /> {new Date(`${a.appointmentDate}T${a.appointmentTime}`).toLocaleDateString()} at {new Date(`${a.appointmentDate}T${a.appointmentTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <StatusBadge status={a.status} />
                                {activeTab === 'upcoming' && (a.status === "REQUESTED" || a.status === "APPROVED") && <button onClick={() => handleCancelAppointment(a.id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={18}/></button>}
                                {activeTab === 'history' && a.status === "COMPLETED" && <button onClick={() => setShowReviewModal(a)} className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-800"><FiEdit/> Review</button>}
                            </div>
                          </li>
                        ))}
                        {(activeTab === 'upcoming' && futureAppointments.length === 0) && <p className="text-center text-gray-500 py-8">No upcoming appointments.</p>}
                        {(activeTab === 'history' && pastAppointments.length === 0) && <p className="text-center text-gray-500 py-8">No past appointments.</p>}
                      </ul>
                    )}
                </motion.div>
                </AnimatePresence>
            </div>
            </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-md border"><h2 className="text-2xl font-bold text-gray-800">Welcome to Your Patient Portal</h2><p className="text-gray-500 mt-2">Please select or create a patient profile to get started.</p></div>
        )}
        
        {showNewForm && <NewPatientModal onClose={() => setShowNewForm(false)} onSubmit={handleCreatePatient} newPatient={newPatient} handleChange={(e) => setNewPatient({ ...newPatient, [e.target.name]: e.target.value })} />}
        {showReviewModal && <ReviewModal appointment={showReviewModal} onClose={() => setShowReviewModal(null)} onSubmit={handleReviewSubmit} />}
        {showPopup && <NotificationPopup message={popupMessage} type={popupMessage.includes("Error") ? "error" : "success"} onClose={() => setShowPopup(false)} />}
      </div>

      <motion.button onClick={() => setChatbotOpen(true)} className="fixed bottom-5 right-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <FiMessageSquare size={30} />
      </motion.button>
      
      <Chatbot isOpen={isChatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  );
};

export default PatientAccess;
