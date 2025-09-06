package com.examly.springapp.service;

import com.examly.springapp.exception.AppointmentConflictException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.model.Doctor;
import com.examly.springapp.model.Patient;
import com.examly.springapp.repository.AppointmentRepository;
import com.examly.springapp.repository.DoctorRepository;
import com.examly.springapp.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public Appointment bookAppointment(Long patientId, Long doctorId, LocalDate appointmentDate, LocalTime appointmentTime, String reason) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(doctorId, appointmentDate, appointmentTime)) {
            throw new AppointmentConflictException("Doctor is already booked at this time slot.");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(appointmentDate);
        appointment.setAppointmentTime(appointmentTime);
        appointment.setReason(reason);
        appointment.setStatus(AppointmentStatus.REQUESTED);
        appointment.setCreatedAt(LocalDateTime.now());

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    public Appointment updateAppointmentStatus(Long id, AppointmentStatus newStatus) {
        Appointment appointment = getAppointmentById(id);
        appointment.setStatus(newStatus);
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // --- UPDATED AND CORRECTED LOGIC ---
    public List<Appointment> getFutureAppointmentsByDoctorId(Long doctorId) {
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> allAppointments = appointmentRepository.findByDoctorId(doctorId);
        return allAppointments.stream()
                .filter(a -> {
                    LocalDateTime appointmentDateTime = LocalDateTime.of(a.getAppointmentDate(), a.getAppointmentTime());
                    return appointmentDateTime.isAfter(now);
                })
                .collect(Collectors.toList());
    }

    // --- UPDATED AND CORRECTED LOGIC ---
    public List<Appointment> getPastAppointmentsByDoctorId(Long doctorId) {
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> allAppointments = appointmentRepository.findByDoctorId(doctorId);
        return allAppointments.stream()
                .filter(a -> {
                    LocalDateTime appointmentDateTime = LocalDateTime.of(a.getAppointmentDate(), a.getAppointmentTime());
                    return appointmentDateTime.isBefore(now) || appointmentDateTime.isEqual(now);
                })
                .collect(Collectors.toList());
    }

    public long getPendingAppointmentsCount(Long doctorId) {
        return getFutureAppointmentsByDoctorId(doctorId).stream()
                .filter(a -> a.getStatus() == AppointmentStatus.REQUESTED)
                .count();
    }
    
    public List<Appointment> getAppointmentsByDoctorAndPatientId(Long doctorId, Long patientId) {
        return appointmentRepository.findByDoctorId(doctorId).stream()
               .filter(a -> a.getPatient().getId().equals(patientId))
               .collect(Collectors.toList());
    }
    
    public long getTotalAppointmentsByDoctorAndPatientId(Long doctorId, Long patientId) {
        return getAppointmentsByDoctorAndPatientId(doctorId, patientId).size();
    }
}
