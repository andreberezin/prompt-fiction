package com.andrekj.ghostwriter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailResponse {
    private String subject;
    private String body;
    private List<EmailResponse.Section> sections;
    private Metadata metadata;
    private ExportFormats exportFormats;
    private String content;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Metadata {
        private int wordCount;
        private String estimatedReadTime;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Section {
        private String type;
        private String title;
        private String markdownContent;
        private String plainTextContent;
        private String richTextContent;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ExportFormats {
        private String markdown;
        private String plainText;
        private String richText;
        private boolean pdfReady;
    }
}
