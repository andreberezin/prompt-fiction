package com.andrekj.ghostwriter.dto;

import com.andrekj.ghostwriter.interfaces.BaseRequest;
import lombok.Data;

@Data
public class BlogRequest implements BaseRequest {
    private String contentType;
    private int wordCount;
    private String aimodel;
    private String topic;
    private String targetAudience;
    private String tone;
    private String expertiseLevel;
    private boolean seoFocus;
}
