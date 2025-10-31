package com.andrekj.ghostwriter.service.blog;

import com.andrekj.ghostwriter.dto.BlogResponse;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import static com.andrekj.ghostwriter.service.util.MetadataUtils.calculateReadtime;
import static com.andrekj.ghostwriter.service.util.MetadataUtils.findSeoKeywords;
import static com.andrekj.ghostwriter.service.util.TextUtils.convertLineToPLainText;
import static com.andrekj.ghostwriter.service.util.TextUtils.countWords;

public class BlogStructurer {

    public static void structure(BlogResponse blogResponse, String rawText) {
        assert rawText != null;
        String[] lines = rawText.split("\n");

        String currentSectionTitle = null;
        String currentSectionType = "introduction";
        StringBuilder currentSectionMarkdownContent = new StringBuilder();
        StringBuilder currentSectionPlainTextContent = new StringBuilder();
        List<BlogResponse.Section> sections = new ArrayList<>();

        // prepare exportFormats and Metadata
        BlogResponse.Metadata metadata = new BlogResponse.Metadata(0, new HashSet<>(), "");
        StringBuilder plainTextBuilder = new StringBuilder();

        for (String line : lines) {
            line = line.trim();
            if (line.isBlank()) continue;

            String plainLine = convertLineToPLainText(line); // get plain text format

            metadata.setWordCount(metadata.getWordCount() + countWords(plainLine)); // get wordcount

            findSeoKeywords(line, metadata); // find seo keywords

            String cleanLine = line.replaceAll("^\\*\\*", "").replaceAll("\\*\\*$", "").trim();
            // parse for structure
            if (cleanLine.startsWith("# ")) { // title
                blogResponse.setTitle(line.substring(1).trim());

                plainTextBuilder.append("\n").append(plainLine).append("\n\n");

            } else if (cleanLine.startsWith("## ")) { // section

                plainTextBuilder.append("\n").append(plainLine).append("\n");

                // previous section
                if (currentSectionType != null && !currentSectionMarkdownContent.isEmpty()) {
                    BlogResponse.Section section = new BlogResponse.Section();
                    section.setType(currentSectionType);
                    section.setTitle(currentSectionTitle);
                    section.setMarkdownContent(currentSectionMarkdownContent.toString().trim());
                    section.setPlainTextContent(currentSectionPlainTextContent.toString().trim());
                    sections.add(section);
                }

                // Start new section
                currentSectionTitle = cleanLine.substring(2).trim();

                // Map header title to section type
                if (currentSectionTitle != null) {
                    String lower = currentSectionTitle.toLowerCase();
                    if (lower.contains("introduction") || lower.contains("intro")) {
                        currentSectionType = "introduction";
                    } else if (lower.contains("conclusion") ||
                            lower.contains("summary") ||
                            lower.contains("wrap up") ||
                            lower.contains("final thoughts")) {
                        currentSectionType = "conclusion";
                    } else {
                        currentSectionType = "body";
                    }
                }

                // reset section content
                currentSectionMarkdownContent = new StringBuilder();
                currentSectionPlainTextContent = new StringBuilder();
            } else {
                plainTextBuilder.append(plainLine).append("\n");

                currentSectionMarkdownContent.append(line).append("\n");
                currentSectionPlainTextContent.append(plainLine).append("\n");
            }
        }

        // Add the last section
        if (currentSectionType != null) {
            BlogResponse.Section section = new BlogResponse.Section();
            section.setType(currentSectionType);
            section.setTitle(currentSectionTitle);
            section.setMarkdownContent(currentSectionMarkdownContent.toString().trim());
            section.setPlainTextContent(currentSectionPlainTextContent.toString().trim());
            sections.add(section);
        }

        BlogResponse.ExportFormats exportFormats = new BlogResponse.ExportFormats(
                rawText, // markdown
                plainTextBuilder.toString().trim(), // plain text
                "", // rich text tbd
                false // pdf ready
        );

        // estimated read time
        metadata.setEstimatedReadTime(calculateReadtime(metadata.getWordCount()));

        // set all final fields
        blogResponse.setSections(sections);
        blogResponse.setMetadata(metadata);
        blogResponse.setExportFormats(exportFormats);
    }
}
