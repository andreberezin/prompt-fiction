package com.andrekj.ghostwriter.service.email;

import com.andrekj.ghostwriter.dto.EmailResponse;

import java.util.List;

import static com.andrekj.ghostwriter.service.util.TextUtils.cleanupText;

public class EmailSanitizer {
    public static void clean(EmailResponse emailResponse) {
        List<EmailResponse.Section> sections = emailResponse.getSections();
        for (EmailResponse.Section section : sections) {
            section.setPlainTextContent(cleanupText(section.getPlainTextContent()));
            section.setMarkdownContent(cleanupText(section.getMarkdownContent()));
            section.setRichTextContent(cleanupText(section.getRichTextContent()));
        }
    }
}
