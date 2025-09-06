// src/main/java/com/examly/springapp/repository/ReviewRepository.java

package com.examly.springapp.repository;

import com.examly.springapp.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByDoctorId(Long doctorId);
    
    Optional<Review> findByAppointmentId(Long appointmentId);

    Optional<Review> findByPatientIdAndDoctorId(Long patientId, Long doctorId);
}
