package com.andrekj.ghostwriter.dto;

import com.andrekj.ghostwriter.interfaces.BaseRequest;
import lombok.Data;

@Data
public class EmailRequest implements BaseRequest {
    private String contentType;
    private int wordCount;
    private String aimodel;
    private String purpose;
    private String recipientContext;
    private String keyPoints;
    private String tone;
    private String urgencyLevel;
    private String cta;
}
