package com.andrekj.ghostwriter.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AIServiceException extends RuntimeException {
    private final HttpStatus status;

    public AIServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

}
