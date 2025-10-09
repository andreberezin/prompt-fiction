package com.andrekj.ghostwriter.dto;

import com.andrekj.ghostwriter.interfaces.BaseResponse;
import lombok.Data;

import java.util.List;

@Data
public class BlogResponse implements BaseResponse {
    private String title;
    private String content;
    private int wordCount;
    private List<String> keywords;
}
