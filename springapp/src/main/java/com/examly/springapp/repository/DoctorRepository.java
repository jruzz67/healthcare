package com.examly.springapp.repository;

import com.examly.springapp.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    boolean existsByEmail(String email);
    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);
}