package com.andrekj.ghostwriter.dto;

import lombok.*;

import java.util.List;
import java.util.Set;

@Data
public class BlogResponse {
    private String title;
    private List<Section> sections;
    private Metadata metadata;
    private ExportFormats exportFormats;
    private String content;
    private int attempts = 1;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Section {
        private String type;
        private String title;
        private String markdownContent;
        private String plainTextContent;
    }

    @Data
    @AllArgsConstructor
    public static class Metadata {
        private int wordCount;
        private Set<String> seoKeywords;
        private String estimatedReadTime;
    }

    @Data
    @AllArgsConstructor
    public static class ExportFormats {
        private String markdown;
        private String plainText;
        private boolean pdfReady;
    }
}
