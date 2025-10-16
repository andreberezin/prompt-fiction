package com.andrekj.ghostwriter.dto;

public class EmailResponse {
    private String subject;
    private String body;
    private Metadata metadata;
    private ExportFormats exportFormats;

    public static class Metadata {
        private int wordCount;
        private String estimatedReadTime;
    }

    public static class ExportFormats {
        private String plainText;
        private String richText;
    }
}
