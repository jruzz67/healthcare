import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBarChart2, FiCalendar } from 'react-icons/fi';

const PatientTrackingModal = ({ doctorId, onClose }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);

  const fetchAppointments = useCallback(async () => {
    if (!doctorId || !selectedPatientId) return; // Don't fetch if IDs are missing
    try {
      const res = await axios.get(`/api/appointments/doctor/${doctorId}/patient/${selectedPatientId}`);
      // --- FIX IS HERE ---
      // We check if the response data is an array. If not, we use an empty array.
      if (Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        setAppointments([]);
      }
    } catch (error) { 
      console.error("Error fetching appointments:", error);
      setAppointments([]); // Also set to empty array on error
    }
  }, [doctorId, selectedPatientId]);

  const fetchTotalAppointments = useCallback(async () => {
    if (!doctorId || !selectedPatientId) return;
    try {
      const res = await axios.get(`/api/appointments/doctor/${doctorId}/patient/${selectedPatientId}/total`);
      setTotalAppointments(res.data.totalAppointments || 0);
    } catch (error) { 
        console.error("Error fetching total appointments:", error);
        setTotalAppointments(0);
    }
  }, [doctorId, selectedPatientId]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await axios.get("/api/patients");
        setPatients(Array.isArray(res.data) ? res.data : []);
      } catch (error) { 
        console.error("Error loading patients:", error);
        setPatients([]);
      }
    };
    loadPatients();
  }, []);

  useEffect(() => {
    if (doctorId && selectedPatientId) {
      fetchAppointments();
      fetchTotalAppointments();
    } else {
      setAppointments([]);
      setTotalAppointments(0);
    }
  }, [doctorId, selectedPatientId, fetchAppointments, fetchTotalAppointments]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FiBarChart2/> Track Patient History</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24}/></button>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="">Select a patient to see their history</option>
              {patients.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>

            {selectedPatientId && (
              <div className="mt-4 bg-purple-50 text-purple-800 p-4 rounded-lg font-semibold">
                Total Appointments Found: {totalAppointments}
              </div>
            )}
            
            <div className="mt-4 max-h-80 overflow-y-auto pr-2 space-y-3">
              {appointments.length > 0 ? (
                appointments.map((a) => (
                  <div key={a.id} className="p-3 bg-gray-50 rounded-lg border flex items-center gap-4">
                    <FiCalendar className="text-gray-500"/>
                    <div>
                      <p className="font-semibold text-gray-800">{new Date(`${a.appointmentDate}T${a.appointmentTime}`).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Status: {a.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                selectedPatientId && <p className="text-gray-500 text-center pt-8">No appointments to display for this patient.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PatientTrackingModal;
