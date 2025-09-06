package com.examly.springapp.controller;

import com.examly.springapp.model.Review;
import com.examly.springapp.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> postReview(@RequestBody Map<String, Object> request) {
        try {
            Long patientId = Long.valueOf(request.get("patientId").toString());
            Long doctorId = Long.valueOf(request.get("doctorId").toString());
            Long appointmentId = Long.valueOf(request.get("appointmentId").toString());
            Integer rating = Integer.valueOf(request.get("rating").toString());
            String comment = request.get("comment").toString();

            Review review = reviewService.postReview(patientId, doctorId, appointmentId, rating, comment);
            return new ResponseEntity<>(review, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Review>> getReviewsByDoctorId(@PathVariable Long doctorId) {
        List<Review> reviews = reviewService.getReviewsByDoctorId(doctorId);
        return ResponseEntity.ok(reviews);
    }

    @DeleteMapping("/patient/{patientId}/doctor/{doctorId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long patientId, @PathVariable Long doctorId) {
        try {
            reviewService.deleteReview(patientId, doctorId);
            return new ResponseEntity<>(Map.of("message", "Review deleted successfully"), HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Review not found"));
        }
    }

    @PutMapping("/patient/{patientId}/doctor/{doctorId}")
    public ResponseEntity<?> editReview(@PathVariable Long patientId, @PathVariable Long doctorId, @RequestBody Map<String, Object> request) {
        try {
            Integer rating = Integer.valueOf(request.get("rating").toString());
            String comment = request.get("comment").toString();

            Review updatedReview = reviewService.editReview(patientId, doctorId, rating, comment);
            return new ResponseEntity<>(updatedReview, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}
