package com.examly.springapp.service;

import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Appointment;
import com.examly.springapp.model.AppointmentStatus;
import com.examly.springapp.model.Doctor;
import com.examly.springapp.model.Patient;
import com.examly.springapp.model.Review;
import com.examly.springapp.repository.AppointmentRepository;
import com.examly.springapp.repository.DoctorRepository;
import com.examly.springapp.repository.PatientRepository;
import com.examly.springapp.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;
    
    // We need these repositories to fetch the objects
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;

    public Review postReview(Long patientId, Long doctorId, Long appointmentId, Integer rating, String comment) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        
        // --- FIX IS HERE: Fetch the Patient and Doctor objects ---
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (!appointment.getPatient().getId().equals(patientId) || !appointment.getDoctor().getId().equals(doctorId)) {
            throw new IllegalStateException("Appointment does not belong to this patient and doctor");
        }
        if (!appointment.getStatus().equals(AppointmentStatus.COMPLETED)) {
            throw new IllegalStateException("Review can only be submitted for completed appointments");
        }
        if (reviewRepository.findByAppointmentId(appointmentId).isPresent()) {
            throw new IllegalStateException("Review already exists for this appointment");
        }

        Review review = Review.builder()
                .appointment(appointment)
                .rating(rating)
                .comment(comment)
                .patient(patient) // Set the patient object
                .doctor(doctor)   // Set the doctor object
                .build();
        
        // The old setPatientId and setDoctorId calls are now removed.

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByDoctorId(Long doctorId) {
        return reviewRepository.findByDoctorId(doctorId);
    }

    public void deleteReview(Long patientId, Long doctorId) {
        Review review = reviewRepository.findByPatientIdAndDoctorId(patientId, doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        reviewRepository.delete(review);
    }

    public Review editReview(Long patientId, Long doctorId, Integer rating, String comment) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        Review review = reviewRepository.findByPatientIdAndDoctorId(patientId, doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setRating(rating);
        review.setComment(comment);
        return reviewRepository.save(review);
    }
}
