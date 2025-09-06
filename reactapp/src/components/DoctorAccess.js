// src/components/DoctorAccess.js

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import PatientTrackingModal from "./PatientTrackingModal";
import NotificationPopup from "./NotificationPopup";
import NewDoctorModal from "./NewDoctorModal";
import { FiPlus, FiBarChart2, FiClock, FiCheckSquare, FiFilter, FiUser, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiStar, FiX, FiMessageSquare, FiFileText } from 'react-icons/fi';

// Helper component for status badges
const StatusBadge = ({ status }) => {
  const statusStyles = {
    REQUESTED: 'bg-yellow-100 text-yellow-800', APPROVED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800', CANCELLED: 'bg-red-100 text-red-800',
    RESCHEDULED: 'bg-purple-100 text-purple-800',
  };
  return <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100'}`}>{status}</span>;
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><FiChevronsLeft /></button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><FiChevronLeft /></button>
            <span className="font-semibold text-sm">Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><FiChevronRight /></button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-gray-100"><FiChevronsRight /></button>
        </div>
    );
};

// Star Rating Display Component
const StarRatingDisplay = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
            <FiStar key={i} size={16} className={i < rating ? "text-yellow-400" : "text-gray-300"} style={{ fill: i < rating ? 'currentColor' : 'none' }} />
        ))}
    </div>
);

// Review Detail Panel Component
const ReviewDetailPanel = ({ appointment, onClose }) => (
    <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Patient Review Details</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
                <div><p className="text-sm font-medium text-gray-500">Patient</p><p className="text-lg font-semibold text-gray-800">{appointment.patient.name}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Appointment Date</p><p className="text-lg font-semibold text-gray-800">{new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`).toLocaleDateString()}</p></div>
                <div><p className="text-sm font-medium text-gray-500">Rating Given</p><StarRatingDisplay rating={appointment.review.rating} /></div>
                <div className="p-4 bg-gray-50 rounded-lg border"><p className="text-sm font-medium text-gray-500 flex items-center gap-2"><FiFileText /> Original Reason</p><p className="text-gray-800 mt-1">{appointment.reason}</p></div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200"><p className="text-sm font-medium text-purple-800 flex items-center gap-2"><FiMessageSquare /> Patient's Comment</p><p className="text-purple-900 mt-1 italic">"{appointment.review.comment}"</p></div>
            </div>
        </motion.div>
    </>
);

const DoctorAccess = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [allFutureAppointments, setAllFutureAppointments] = useState([]);
  const [allPastAppointments, setAllPastAppointments] = useState([]);
  const [doctorReviews, setDoctorReviews] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [futureCurrentPage, setFutureCurrentPage] = useState(1);
  const [pastCurrentPage, setPastCurrentPage] = useState(1);
  const APPOINTMENTS_PER_PAGE = 4;
  const [showNewForm, setShowNewForm] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: "", specialization: "", email: "", phoneNumber: "" });
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedPastAppointment, setSelectedPastAppointment] = useState(null);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const { data } = await axios.get("/api/doctors");
        setDoctors(data || []);
      } catch (error) { console.error("Error loading doctors:", error); }
    };
    loadDoctors();
  }, []);

  useEffect(() => {
    const fetchAllData = async (doctorId) => {
        try {
            const [detailsRes, futureRes, pastRes, reviewsRes, pendingRes] = await Promise.all([
                axios.get(`/api/doctors/${doctorId}`),
                axios.get(`/api/appointments/doctor/${doctorId}/future`),
                axios.get(`/api/appointments/doctor/${doctorId}/past`),
                axios.get(`/api/reviews/doctor/${doctorId}`),
                axios.get(`/api/appointments/doctor/${doctorId}/pending`)
            ]);
            setDoctorName(detailsRes.data.name || "Doctor");
            
            // --- FIX IS HERE: Ensure the data is always an array ---
            setAllFutureAppointments(Array.isArray(futureRes.data) ? futureRes.data : []);
            setAllPastAppointments(Array.isArray(pastRes.data) ? pastRes.data : []);
            setDoctorReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
            
            setPendingCount(pendingRes.data.pendingCount || 0);
        } catch (error) {
            console.error("Error fetching doctor data:", error);
            // Also reset to empty arrays on error to prevent crashes
            setAllFutureAppointments([]);
            setAllPastAppointments([]);
            setDoctorReviews([]);
        }
    };

    if (selectedDoctorId) {
      fetchAllData(selectedDoctorId);
    } else {
      setDoctorName("");
      setAllFutureAppointments([]);
      setAllPastAppointments([]);
      setDoctorReviews([]);
      setPendingCount(0);
    }
  }, [selectedDoctorId]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/api/appointments/${id}/status`, { status });
      if (selectedDoctorId) {
        const [futureRes, pastRes, pendingRes] = await Promise.all([
            axios.get(`/api/appointments/doctor/${selectedDoctorId}/future`),
            axios.get(`/api/appointments/doctor/${selectedDoctorId}/past`),
            axios.get(`/api/appointments/doctor/${selectedDoctorId}/pending`)
        ]);
        setAllFutureAppointments(Array.isArray(futureRes.data) ? futureRes.data : []);
        setAllPastAppointments(Array.isArray(pastRes.data) ? pastRes.data : []);
        setPendingCount(pendingRes.data.pendingCount || 0);
      }
      setMessage("Appointment status updated!"); setShowPopup(true);
    } catch (error) {
      setMessage("Error updating status."); setShowPopup(true);
    }
  };

  const processedAppointments = useMemo(() => {
    // Make a copy to avoid mutating state directly, which can cause issues.
    let futureItems = [...allFutureAppointments];
    let pastItems = [...allPastAppointments];

    if (filterStatus !== 'all') {
      futureItems = futureItems.filter(a => a.status === filterStatus);
    }
    
    // Sorting logic
    futureItems.sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime}`) - new Date(`${b.appointmentDate}T${b.appointmentTime}`));
    
    const pastAppointmentsWithReviews = pastItems.map(appointment => {
        const review = doctorReviews.find(r => r.appointmentId === appointment.id);
        return review ? { ...appointment, review } : appointment;
    });
    
    pastAppointmentsWithReviews.sort((a, b) => new Date(`${b.appointmentDate}T${b.appointmentTime}`) - new Date(`${a.appointmentDate}T${a.appointmentTime}`));
    
    return { futureItems, pastItems: pastAppointmentsWithReviews };
  }, [allFutureAppointments, allPastAppointments, doctorReviews, filterStatus]);

  const futureTotalPages = Math.ceil(processedAppointments.futureItems.length / APPOINTMENTS_PER_PAGE);
  const pastTotalPages = Math.ceil(processedAppointments.pastItems.length / APPOINTMENTS_PER_PAGE);
  const paginatedFutureAppointments = processedAppointments.futureItems.slice((futureCurrentPage - 1) * APPOINTMENTS_PER_PAGE, futureCurrentPage * APPOINTMENTS_PER_PAGE);
  const paginatedPastAppointments = processedAppointments.pastItems.slice((pastCurrentPage - 1) * APPOINTMENTS_PER_PAGE, pastCurrentPage * APPOINTMENTS_PER_PAGE);

  return (
    <>
      <div className="space-y-8">
        <div className="bg-white p-4 rounded-xl shadow-md border flex flex-col md:flex-row items-center justify-between gap-4">
          <select value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} className="w-full md:w-auto p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
            <option value="">Select Your Profile</option>
            {doctors.map((d) => (<option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>))}
          </select>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowNewForm(true)} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"><FiPlus /> New Doctor</button>
            <button onClick={() => setShowTrackModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"><FiBarChart2 /> Track Patient</button>
          </div>
        </div>
        {selectedDoctorId ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border">
              <h2 className="text-3xl font-bold text-gray-900">Welcome back, Dr. {doctorName}</h2>
              <p className="text-gray-600 mt-1">You have <span className="font-bold text-purple-600">{pendingCount}</span> pending appointment requests.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FiClock/> Upcoming Appointments</h3>
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                      <FiFilter className="text-gray-500"/>
                      <select onChange={(e) => { setFilterStatus(e.target.value); setFutureCurrentPage(1); }} value={filterStatus} className="bg-transparent text-sm font-semibold focus:outline-none">
                          <option value="all">All Statuses</option><option value="REQUESTED">Requested</option>
                          <option value="APPROVED">Approved</option><option value="RESCHEDULED">Rescheduled</option>
                      </select>
                  </div>
                </div>
                <ul className="space-y-4 min-h-[420px]">
                  {paginatedFutureAppointments.length > 0 ? paginatedFutureAppointments.map(a => (
                    <li key={a.id} className="bg-gray-50 p-4 rounded-lg border hover:border-purple-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3"><div className="bg-purple-100 p-2 rounded-full text-purple-600"><FiUser /></div><div><p className="font-bold text-gray-800">{a.patient.name}</p><p className="text-sm text-gray-500">{new Date(`${a.appointmentDate}T${a.appointmentTime}`).toLocaleString()}</p></div></div>
                        <StatusBadge status={a.status} />
                      </div>
                      <div className="mt-3 pt-3 border-t flex items-center justify-between"><p className="text-sm text-gray-600 truncate pr-2">Reason: {a.reason}</p><select onChange={(e) => handleStatusChange(a.id, e.target.value)} value={a.status} className="p-2 bg-white border rounded-md text-sm"><option value="REQUESTED">Requested</option><option value="APPROVED">Approved</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option><option value="RESCHEDULED">Rescheduled</option></select></div>
                    </li>
                  )) : <p className="text-center text-gray-500 py-8">No upcoming appointments found.</p>}
                </ul>
                <Pagination currentPage={futureCurrentPage} totalPages={futureTotalPages} onPageChange={setFutureCurrentPage} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4"><FiCheckSquare /> Past Appointments</h3>
                <ul className="space-y-3 min-h-[420px]">
                  {paginatedPastAppointments.length > 0 ? paginatedPastAppointments.map(a => (
                    <li key={a.id} onClick={() => a.review && setSelectedPastAppointment(a)} className={`bg-gray-50 p-3 rounded-lg border text-sm ${a.review ? 'cursor-pointer hover:border-purple-300 transition-colors' : 'cursor-default'}`}>
                      <div className="flex justify-between items-center">
                        <div><p className="font-semibold text-gray-700">{a.patient.name}</p><p className="text-gray-500">{new Date(`${a.appointmentDate}T${a.appointmentTime}`).toLocaleDateString()}</p></div>
                        {a.review ? <StarRatingDisplay rating={a.review.rating} /> : <StatusBadge status={a.status} />}
                      </div>
                    </li>
                  )) : <p className="text-center text-gray-500 py-8">No past appointments.</p>}
                </ul>
                <Pagination currentPage={pastCurrentPage} totalPages={pastTotalPages} onPageChange={setPastCurrentPage} />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-md border"><h2 className="text-2xl font-bold text-gray-800">Welcome, Doctor</h2><p className="text-gray-500 mt-2">Please select your profile to view your schedule.</p></div>
        )}
        {showPopup && <NotificationPopup message={message} type={message.includes("Error") ? "error" : "success"} onClose={() => setShowPopup(false)} />}
        {showTrackModal && <PatientTrackingModal doctorId={selectedDoctorId} onClose={() => setShowTrackModal(false)} />}
        {showNewForm && <NewDoctorModal onClose={() => setShowNewForm(false)} onSubmit={(e) => { e.preventDefault(); }} newDoctor={newDoctor} handleChange={(e) => setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value })} />}
      </div>
      <AnimatePresence>
        {selectedPastAppointment && (<ReviewDetailPanel appointment={selectedPastAppointment} onClose={() => setSelectedPastAppointment(null)} />)}
      </AnimatePresence>
    </>
  );
};

export default DoctorAccess;
