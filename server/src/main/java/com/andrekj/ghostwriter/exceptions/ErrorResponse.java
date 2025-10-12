package com.andrekj.ghostwriter.exceptions;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ErrorResponse {
    private String error;
    private String message;
    private int status;
    private LocalDateTime timestamp = LocalDateTime.now();

    public ErrorResponse(String error, String message, int status) {
        this.error = error;
        this.message = message;
        this.status = status;
    }
}
