package com.examly.springapp.controller;

import com.examly.springapp.exception.AppointmentConflictException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.repository.PatientRepository;
import com.examly.springapp.service.AppointmentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/appointments")
public class AppointmentController {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody Map<String, Object> request) {
        logger.info("Received appointment request: {}", request);
        try {
            Long patientId = Long.valueOf(request.get("patientId").toString());
            Long doctorId = Long.valueOf(request.get("doctorId").toString());
            LocalDate appointmentDate = LocalDate.parse(request.get("appointmentDate").toString());
            LocalTime appointmentTime = LocalTime.parse(request.get("appointmentTime").toString());
            String reason = request.get("reason").toString();

            Appointment savedAppointment = appointmentService.bookAppointment(
                    patientId, doctorId, appointmentDate, appointmentTime, reason);
            logger.info("Appointment booked successfully: {}", savedAppointment);
            return new ResponseEntity<>(savedAppointment, HttpStatus.CREATED);

        } catch (AppointmentConflictException e) {
            logger.warn("Appointment conflict detected: {}", e.getMessage());
            return new ResponseEntity<>(Map.of("message", e.getMessage()), HttpStatus.CONFLICT);
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return new ResponseEntity<>(Map.of("message", e.getMessage()), HttpStatus.NOT_FOUND);
        } catch (DateTimeParseException e) {
            logger.error("Invalid date or time format: {}", e.getMessage());
            return new ResponseEntity<>(Map.of("message", "Invalid date or time format"), HttpStatus.BAD_REQUEST);
        } catch (NumberFormatException e) {
            logger.error("Invalid ID format: {}", e.getMessage());
            return new ResponseEntity<>(Map.of("message", "Invalid ID format"), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getAppointmentsByPatient(@PathVariable Long patientId) {
        logger.info("Fetching appointments for patientId: {}", patientId);
        if (!patientRepository.existsById(patientId)) {
            logger.warn("Attempted to fetch appointments for non-existent patientId: {}", patientId);
            return new ResponseEntity<>(Map.of("message", "Patient not found"), HttpStatus.NOT_FOUND);
        }
        List<Appointment> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }
    
    // --- THIS IS THE UPDATED METHOD ---
    @GetMapping("/doctor/{doctorId}/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctorAndPatient(@PathVariable Long doctorId, @PathVariable Long patientId) {
        logger.info("Fetching appointments for doctorId: {} and patientId: {}", doctorId, patientId);
        try {
            // This service call will now always return a list, even if it's empty,
            // which is safer for the frontend.
            List<Appointment> appointments = appointmentService.getAppointmentsByDoctorAndPatientId(doctorId, patientId);
            return ResponseEntity.ok(appointments);
        } catch (ResourceNotFoundException e) {
            logger.error("Doctor or patient not found for IDs: {} or {}", doctorId, patientId, e);
            // If the doctor or patient doesn't exist, return an empty list to prevent frontend crashes.
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        Appointment appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("status");
        Appointment updatedAppointment = appointmentService.updateAppointmentStatus(id, AppointmentStatus.valueOf(newStatus));
        return ResponseEntity.ok(updatedAppointment);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        logger.info("Fetching appointments for doctorId: {}", doctorId);
        List<Appointment> appointments = appointmentService.getAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/doctor/{doctorId}/future")
    public ResponseEntity<List<Appointment>> getFutureAppointmentsByDoctor(@PathVariable Long doctorId) {
        logger.info("Fetching future appointments for doctorId: {}", doctorId);
        List<Appointment> appointments = appointmentService.getFutureAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/doctor/{doctorId}/past")
    public ResponseEntity<List<Appointment>> getPastAppointmentsByDoctor(@PathVariable Long doctorId) {
        logger.info("Fetching past appointments for doctorId: {}", doctorId);
        List<Appointment> appointments = appointmentService.getPastAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/doctor/{doctorId}/pending")
    public ResponseEntity<Map<String, Long>> getPendingAppointmentsCount(@PathVariable Long doctorId) {
        logger.info("Fetching pending appointments count for doctorId: {}", doctorId);
        long count = appointmentService.getPendingAppointmentsCount(doctorId);
        return ResponseEntity.ok(Map.of("pendingCount", count));
    }

    @GetMapping("/doctor/{doctorId}/patient/{patientId}/total")
    public ResponseEntity<Map<String, Long>> getTotalAppointmentsByDoctorAndPatient(@PathVariable Long doctorId, @PathVariable Long patientId) {
        logger.info("Fetching total appointments for doctorId: {} and patientId: {}", doctorId, patientId);
        long total = appointmentService.getTotalAppointmentsByDoctorAndPatientId(doctorId, patientId);
        return ResponseEntity.ok(Map.of("totalAppointments", total));
    }
}
