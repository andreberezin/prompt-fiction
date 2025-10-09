package com.andrekj.ghostwriter.dto;

import lombok.Data;

@Data
public class BlogRequest {
    private String contentType;
    private String topic;
    private String targetAudience;
    private String tone;
    private String expertiseLevel;
    private int wordCount;
    private boolean seoFocus;
}
