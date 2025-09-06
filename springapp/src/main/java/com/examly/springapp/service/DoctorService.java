package com.examly.springapp.service;

import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.model.Doctor;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.AppointmentRepository;
import com.examly.springapp.repository.DoctorRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Transactional
    public Doctor createDoctor(Doctor doctor) {
        if (doctor == null) {
            throw new IllegalArgumentException("Doctor object cannot be null");
        }
        if (doctor.getEmail() == null || doctor.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (userRepository.findByEmailId(doctor.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (doctor.getName() == null || doctor.getName().isEmpty() ||
            doctor.getPhoneNumber() == null || doctor.getPhoneNumber().isEmpty() ||
            doctor.getSpecialization() == null || doctor.getSpecialization().isEmpty()) {
            throw new IllegalArgumentException("Name, phone number, and specialization are required");
        }

        // Save Doctor first
        Doctor savedDoctor = doctorRepository.save(doctor);

        // Create and save User (no role needed)
        User user = new User();
        user.setEmailId(doctor.getEmail());
        user.setDoctor(savedDoctor);
        userRepository.save(user);

        // Link back to Doctor (bidirectional)
        savedDoctor.setUser(user);
        return doctorRepository.save(savedDoctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    public Doctor updateDoctor(Long id, Doctor doctorDetails) {
        Doctor doctor = getDoctorById(id);
        doctor.setName(doctorDetails.getName());
        doctor.setSpecialization(doctorDetails.getSpecialization());
        doctor.setPhoneNumber(doctorDetails.getPhoneNumber());
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        List<Appointment> appointments = appointmentRepository.findByDoctorId(id);
        if (appointments.stream().anyMatch(a -> !a.getStatus().equals(AppointmentStatus.COMPLETED))) {
            throw new IllegalStateException("Cannot delete doctor with non-completed appointments");
        }
        appointmentRepository.deleteAll(appointments);
        userRepository.deleteById(doctor.getUser().getId());
        doctorRepository.delete(doctor);
    }

    public List<Doctor> searchDoctors(String specialization) {
        if (specialization != null && !specialization.isEmpty()) {
            return doctorRepository.findBySpecializationContainingIgnoreCase(specialization);
        } else {
            return doctorRepository.findAll();
        }
    }

    public UserRepository getUserRepository() {
        return userRepository;
    }
}
