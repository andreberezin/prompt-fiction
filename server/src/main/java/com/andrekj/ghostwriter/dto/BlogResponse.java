package com.andrekj.ghostwriter.dto;

import lombok.Data;

import java.util.List;

@Data
public class BlogResponse {
    private String title;
    private String content;
    private int wordCount;
    private List<String> keywords;
}
