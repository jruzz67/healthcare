import React, { useEffect, useState } from "react";
import axios from "axios";

function normalizeTimeToHMS(t) {
  if (!t) return t;
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  return t;
}

export default function AppointmentForm() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          axios.get("/api/patients"),
          axios.get("/api/doctors"),
        ]);
        if (mounted) {
          setPatients(pRes.data || []);
          setDoctors(dRes.data || []);
        }
      } catch (_) {
        if (mounted) {
          setPatients([]);
          setDoctors([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
    setServerError("");
  };

  const validate = () => {
    const err = {};
    if (!form.patient) err.patient = "Patient is required";
    if (!form.doctor) err.doctor = "Doctor is required";
    if (!form.date) err.date = "Date is required";
    if (!form.time) err.time = "Time is required";
    if (!form.reason || !form.reason.trim()) err.reason = "Reason is required";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setServerError("");
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const payload = {
      patientId: parseInt(form.patient, 10),
      doctorId: parseInt(form.doctor, 10),
      appointmentDate: form.date,
      appointmentTime: normalizeTimeToHMS(form.time),
      reason: form.reason.trim(),
    };

    try {
      await axios.post("/api/appointments", payload);
      setMessage("Appointment successfully booked");
      setForm({
        patient: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
      });
    } catch (e2) {
      setServerError(e2.response?.data?.message || "Server error");
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg animate-slide-up">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Book Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700">
            Patient
          </label>
          <select
            id="patient-select"
            data-testid="patient-select"
            name="patient"
            value={form.patient}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.patient && <div className="text-red-500 text-sm mt-1">{errors.patient}</div>}
        </div>

        <div>
          <label htmlFor="doctor-select" className="block text-sm font-medium text-gray-700">
            Doctor
          </label>
          <select
            id="doctor-select"
            data-testid="doctor-select"
            name="doctor"
            value={form.doctor}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name} {d.specialization ? `(${d.specialization})` : ""}
              </option>
            ))}
          </select>
          {errors.doctor && <div className="text-red-500 text-sm mt-1">{errors.doctor}</div>}
        </div>

        <div>
          <label htmlFor="date-input" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            id="date-input"
            data-testid="date-input"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
        </div>

        <div>
          <label htmlFor="time-input" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <input
            id="time-input"
            data-testid="time-input"
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.time && <div className="text-red-500 text-sm mt-1">{errors.time}</div>}
        </div>

        <div>
          <label htmlFor="reason-input" className="block text-sm font-medium text-gray-700">
            Reason
          </label>
          <input
            id="reason-input"
            data-testid="reason-input"
            type="text"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Enter reason"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.reason && <div className="text-red-500 text-sm mt-1">{errors.reason}</div>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Book Appointment
        </button>
      </form>
      {message && <div className="text-green-600 text-center mt-4">{message}</div>}
      {serverError && <div className="text-red-600 text-center mt-4">{serverError}</div>}
    </div>
  );
}
