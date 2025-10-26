package com.andrekj.ghostwriter.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AIServiceException.class)
    public ResponseEntity<ErrorResponse> handleAiServiceException(AIServiceException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "AI service error",
                ex.getMessage(),
                ex.getStatus().value()
        );
        return ResponseEntity
                .status(ex.getStatus())
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
    }

    @ExceptionHandler(ContentGenerationException.class)
    public ResponseEntity<ErrorResponse> handleContentGenerationException(ContentGenerationException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Content generation error",
                ex.getMessage(),
                HttpStatus.UNPROCESSABLE_ENTITY.value()
        );
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Unexpected error",
                ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorResponse);
    }
}