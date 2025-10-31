package com.andrekj.ghostwriter.service.email;

import com.andrekj.ghostwriter.dto.EmailResponse;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.andrekj.ghostwriter.service.util.MetadataUtils.calculateReadtime;
import static com.andrekj.ghostwriter.service.util.TextUtils.*;

public class EmailStructurer {

    public static void structure(EmailResponse emailResponse, String rawResponse) {
        assert rawResponse != null;
        String[] lines = rawResponse.split("\n");

        String currentSectionTitle = null;
        String currentSectionType = null;
        StringBuilder currentSectionMarkdownContent = new StringBuilder();
        StringBuilder currentSectionPlainTextContent = new StringBuilder();
        StringBuilder bodyContent = new StringBuilder();
        List<EmailResponse.Section> sections = new ArrayList<>();

        EmailResponse.Metadata metadata = new EmailResponse.Metadata();
        StringBuilder plainTextBuilder = new StringBuilder();

        int blankLineCount = 0;
        int heading2Count = 0;

        for (String line : lines) {
            line = line.trim();

            if (line.isEmpty()) {
                blankLineCount++;
                if (blankLineCount <= 1) {
                    currentSectionMarkdownContent.append("\n");
                    currentSectionPlainTextContent.append("\n");
                    plainTextBuilder.append("\n");
                }
                continue;
            } else {
                blankLineCount = 0;
            }

            String plainLine = convertLineToPLainText(line);

            String cleanLine = line.replaceAll("^\\*\\*", "").replaceAll("\\*\\*$", "").trim();

            if (cleanLine.startsWith("# ") || cleanLine.startsWith("1 # ") ||
                    cleanLine.matches("^#[A-Za-z].*") || cleanLine.matches("^1#[A-Za-z].*")) {

                if (cleanLine.startsWith("1")) cleanLine = cleanLine.substring(1).trim();


                // Determine if the AI included the "Subject line" heading
                String subjectCandidate = cleanLine.substring(1).trim(); // raw subject line without the first #
                String nextLine = ""; // we'll capture the next non-empty line if needed

                // Skip "Subject line" title if present
                if (subjectCandidate.toLowerCase().startsWith("subject")) {
                    // Find the actual subject on the next line
                    int currentIndex = Arrays.asList(lines).indexOf(line);
                    for (int i = currentIndex + 1; i < lines.length; i++) {
                        String potentialSubject = lines[i].trim();
                        if (!potentialSubject.isEmpty() && !potentialSubject.startsWith("#")) {
                            nextLine = potentialSubject;
                            break;
                        }
                    }

                    if (!nextLine.isEmpty()) {
                        emailResponse.setSubject(nextLine);
                        // todo fix this stupid -2 (I think it counts "Subject line" because the word count is always off by +2)
                        metadata.setWordCount(metadata.getWordCount() + countWords(plainLine) - 2);
                    }

                } else {
                    // Normal case: the line itself is the subject
                    emailResponse.setSubject(subjectCandidate);
                    metadata.setWordCount(metadata.getWordCount() + countWords(plainLine));
                }

                currentSectionTitle = "Subject line";
                currentSectionType = "subject";

                //exclude the section titles for email plain text content
                if (!plainLine.startsWith("Subject")) {
                    plainTextBuilder.append("\n").append(plainLine).append("\n\n");
                }

            } else if (cleanLine.startsWith("##") || cleanLine.startsWith("1 ##") || cleanLine.startsWith("1##")) {
                if (cleanLine.startsWith("1")) cleanLine = cleanLine.substring(1).trim();

                if (currentSectionType != null && !currentSectionType.equalsIgnoreCase("subject") && !currentSectionMarkdownContent.isEmpty()) {
                    EmailResponse.Section section = new EmailResponse.Section();
                    section.setType(currentSectionType);
                    section.setTitle(currentSectionTitle);
                    section.setMarkdownContent(currentSectionMarkdownContent.toString().trim());
                    section.setPlainTextContent(currentSectionPlainTextContent.toString().trim());
                    sections.add(section);
                }

                heading2Count++;

                // Assign section type manually because sometimes the AI response includes them but sometimes not
                switch (heading2Count) {
                    case 1 -> { currentSectionTitle = "Greeting"; currentSectionType = "greeting"; }
                    case 2 -> { currentSectionTitle = "Body"; currentSectionType = "body"; }
                    case 3 -> { currentSectionTitle = "Closing and signature"; currentSectionType = "closing and signature"; }
                    case 4 -> { currentSectionTitle = "Call to action"; currentSectionType = "cta"; }
                }

                currentSectionMarkdownContent = new StringBuilder();
                currentSectionPlainTextContent = new StringBuilder();

                //
                if (plainLine.startsWith("Greeting") || plainLine.startsWith("Body") || plainLine.startsWith("Closing") || plainLine.startsWith("Call to action")) {
                    continue;
                } else { // if the AI response doesn't include headings then append that line to the section's content
                    bodyContent.append(plainLine).append("\n");
                    plainTextBuilder.append("\n").append(plainLine).append("\n\n");
                    currentSectionPlainTextContent.append(line.substring(2).trim()).append("\n");
                    currentSectionMarkdownContent.append(line.substring(2).trim()).append("\n");
                }
            } else {
                metadata.setWordCount(metadata.getWordCount() + countWords(plainLine));

                plainTextBuilder.append(plainLine).append("\n");
                bodyContent.append(plainLine).append("\n");

                currentSectionMarkdownContent.append(line).append("\n");
                currentSectionPlainTextContent.append(plainLine).append("\n");
            }
        }

        // Add the last section
        if (currentSectionType != null) {
            EmailResponse.Section section = new EmailResponse.Section();
            section.setType(currentSectionType);
            section.setTitle(currentSectionTitle);
            section.setMarkdownContent(currentSectionMarkdownContent.toString().trim());
            section.setPlainTextContent(currentSectionPlainTextContent.toString().trim());
            sections.add(section);

        }
        EmailResponse.ExportFormats exportFormats = new EmailResponse.ExportFormats(
                rawResponse, // markdown
                plainTextBuilder.toString().trim(), // plain text
                "", // rich text tbd
                false // pdf ready
        );

        metadata.setEstimatedReadTime(calculateReadtime(metadata.getWordCount()));

        emailResponse.setBody(bodyContent.toString().trim());
        emailResponse.setSections(sections);
        emailResponse.setMetadata(metadata);
        emailResponse.setExportFormats(exportFormats);
    }
}
