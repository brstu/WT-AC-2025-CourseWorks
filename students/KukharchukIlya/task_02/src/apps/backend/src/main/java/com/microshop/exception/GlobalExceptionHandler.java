package com.microshop.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(HttpMessageNotWritableException.class)
    public ResponseEntity<ErrorResponse> handleSerializationException(HttpMessageNotWritableException e) {
        String message = "Cannot serialize: " + (e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
        ErrorResponse error = new ErrorResponse("error", message, null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException e) {
        String message = e.getMessage() != null ? e.getMessage() : "Internal server error";
        ErrorResponse error = new ErrorResponse("error", message, null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ErrorResponse error = new ErrorResponse("error", "Validation failed", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    public static class ErrorResponse {
        private String status;
        private String message;
        private Map<String, String> errors;
        
        public ErrorResponse(String status, String message, Map<String, String> errors) {
            this.status = status;
            this.message = message;
            this.errors = errors;
        }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Map<String, String> getErrors() { return errors; }
        public void setErrors(Map<String, String> errors) { this.errors = errors; }
    }
}
