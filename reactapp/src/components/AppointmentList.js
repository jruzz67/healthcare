import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AppointmentList() {
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/api/patients");
        if (mounted) setPatients(res.data || []);
      } catch (_) {
        if (mounted) setPatients([]);
      } finally {
        if (mounted) setLoadingPatients(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onChangePatient = async (e) => {
    const pid = e.target.value;
    setSelectedPatient(pid);
    if (!pid) {
      setAppointments([]);
      return;
    }
    setLoadingAppointments(true);
    try {
      const res = await axios.get(`/api/appointments/patient/${pid}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  if (loadingPatients) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg animate-slide-up">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Appointments</h2>
      <div className="mb-4">
        <label htmlFor="patient-filter" className="block text-sm font-medium text-gray-700">
          Filter by Patient
        </label>
        <select
          id="patient-filter"
          data-testid="patient-filter"
          value={selectedPatient}
          onChange={onChangePatient}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {loadingAppointments && <div className="text-center text-gray-600">Loading...</div>}

      {!loadingAppointments && selectedPatient && appointments.length === 0 && (
        <div data-testid="no-appointments" className="text-gray-500 text-center mt-4">
          No appointments found
        </div>
      )}

      {!loadingAppointments && appointments.length > 0 && (
        <ul className="space-y-4">
          {appointments.map((a) => (
            <li key={a.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <div className="text-gray-700">
                <strong>ID:</strong> {a.id}
              </div>
              <div className="text-gray-700">
                <strong>Date:</strong> {a.appointmentDate} {a.appointmentTime}
              </div>
              <div className="text-gray-700">
                <strong>Status:</strong> {a.status}
              </div>
              <div className="text-gray-700">
                <strong>Reason:</strong> {a.reason}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
