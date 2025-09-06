package com.examly.springapp.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user", uniqueConstraints = {@UniqueConstraint(columnNames = "email_id")})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email_id", nullable = false)
    private String emailId;

    @OneToOne
    @JoinColumn(name = "patient_id", unique = true)
    @JsonManagedReference // Manages the forward reference
    private Patient patient;

    @OneToOne
    @JoinColumn(name = "doctor_id", unique = true)
    @JsonManagedReference // Manages the forward reference
    private Doctor doctor;
}
