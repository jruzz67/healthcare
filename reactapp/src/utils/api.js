const BASE_URL = "https://8080-bdecacfaeccfdbaddfafafdbcfadcccca.premiumproject.examly.io";

export async function fetchPatients() {
  const res = await fetch(`${BASE_URL}/api/patients`);
  if (!res.ok) throw new Error(`Failed to fetch patients: ${res.statusText}`);
  return res.json();
}

export async function fetchDoctors() {
  const res = await fetch(`${BASE_URL}/api/doctors`);
  if (!res.ok) throw new Error(`Failed to fetch doctors: ${res.statusText}`);
  return res.json();
}

export async function createPatient(patient) {
  const res = await fetch(`${BASE_URL}/api/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient),
  });
  if (!res.ok) throw new Error(`Failed to create patient: ${res.statusText}`);
  return res.json();
}

export async function createAppointment(payload) {
  const res = await fetch(`${BASE_URL}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create appointment: ${res.statusText}`);
  return res.json();
}

export async function updateAppointmentStatus(id, status) {
  const res = await fetch(`${BASE_URL}/api/appointments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
  return res.json();
}

export async function fetchAppointmentsByPatient(patientId) {
  const res = await fetch(`${BASE_URL}/api/appointments/patient/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.statusText}`);
  return res.json();
}

export async function fetchAppointmentsByDoctor(doctorId) {
  const res = await fetch(`${BASE_URL}/api/appointments/doctor/${doctorId}`);
  if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.statusText}`);
  return res.json();
}
