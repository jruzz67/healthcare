package com.examly.springapp.service;

import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.model.Patient;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.AppointmentRepository;
import com.examly.springapp.repository.PatientRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Transactional
    public Patient createPatient(Patient patient) {
        if (patient == null) {
            throw new IllegalArgumentException("Patient object cannot be null");
        }
        if (patient.getEmail() == null || patient.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (userRepository.findByEmailId(patient.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (patient.getName() == null || patient.getName().isEmpty() ||
            patient.getPhoneNumber() == null || patient.getPhoneNumber().isEmpty()) {
            throw new IllegalArgumentException("Name and phone number are required");
        }

        Patient savedPatient = patientRepository.save(patient);
        User user = new User();
        user.setEmailId(patient.getEmail());
        user.setPatient(savedPatient);
        user = userRepository.save(user);
        savedPatient.setUser(user);
        return patientRepository.save(savedPatient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = getPatientById(id);
        patient.setName(patientDetails.getName());
        patient.setPhoneNumber(patientDetails.getPhoneNumber());
        patient.setDateOfBirth(patientDetails.getDateOfBirth());
        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        Patient patient = getPatientById(id);
        List<Appointment> appointments = appointmentRepository.findByPatientId(id);
        if (appointments.stream().anyMatch(a -> !a.getStatus().equals(AppointmentStatus.COMPLETED))) {
            throw new IllegalStateException("Cannot delete patient with non-completed appointments");
        }
        appointmentRepository.deleteAll(appointments);
        userRepository.deleteById(patient.getUser().getId());
        patientRepository.delete(patient);
    }

    public List<Patient> searchPatients(String name) {
        if (name != null && !name.isEmpty()) {
            return patientRepository.findByNameContainingIgnoreCase(name);
        } else {
            return patientRepository.findAll();
        }
    }

    public UserRepository getUserRepository() {
        return userRepository;
    }
}
