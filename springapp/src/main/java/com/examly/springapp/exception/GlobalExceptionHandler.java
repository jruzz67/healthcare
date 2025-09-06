        package com.examly.springapp.exception;

        import org.springframework.http.HttpStatus;
        import org.springframework.http.ResponseEntity;
        import org.springframework.validation.FieldError;
        import org.springframework.web.bind.MethodArgumentNotValidException;
        import org.springframework.web.bind.annotation.ExceptionHandler;
        import org.springframework.web.bind.annotation.RestControllerAdvice;

        import java.util.HashMap;
        import java.util.Map;

        @RestControllerAdvice
        public class GlobalExceptionHandler {

                @ExceptionHandler(ResourceNotFoundException.class)
                public ResponseEntity<Map<String, String>> handleResourceNotFoundException(ResourceNotFoundException ex) {
                                Map<String, String> errorResponse = new HashMap<>();
                                        errorResponse.put("message", ex.getMessage());
                                                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
                }

                        @ExceptionHandler(AppointmentConflictException.class)
                        public ResponseEntity<Map<String, String>> handleAppointmentConflictException(AppointmentConflictException ex) {
                                        Map<String, String> errorResponse = new HashMap<>();
                                                errorResponse.put("message", ex.getMessage());
                                                        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
                        }

                                @ExceptionHandler(MethodArgumentNotValidException.class)
                                public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
                                                Map<String, String> errors = new HashMap<>();
                                                        ex.getBindingResult().getAllErrors().forEach((error) -> {
                                                                        String fieldName = ((FieldError) error).getField();
                                                                                String errorMessage = error.getDefaultMessage();
                                                                                                errors.put(fieldName, errorMessage);
                                                        });
                                                                
                                                                Map<String, String> response = new HashMap<>();
                                                                        response.put("message", errors.values().iterator().next()); // Get the first error message
                                                                                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                                                                                }

                                                                                        @ExceptionHandler(Exception.class)
                                                                                        public ResponseEntity<Map<String, String>> handleGeneralExceptions(Exception ex) {
                                                                                                        Map<String, String> errorResponse = new HashMap<>();
                                                                                                                errorResponse.put("message", "An unexpected error occurred: " + ex.getMessage());
                                                                                                                        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
                                                                                                                        }
                                                                                                                        }