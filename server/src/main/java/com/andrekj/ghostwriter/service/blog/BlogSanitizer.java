package com.andrekj.ghostwriter.service.blog;

import com.andrekj.ghostwriter.dto.BlogResponse;
import java.util.List;
import static com.andrekj.ghostwriter.service.util.TextUtils.cleanupText;

public class BlogSanitizer {

    public static void clean(BlogResponse blogResponse) {
        List<BlogResponse.Section> sections = blogResponse.getSections();
        for (BlogResponse.Section section : sections) {
            section.setPlainTextContent(cleanupText(section.getPlainTextContent()));
            section.setMarkdownContent(cleanupText(section.getMarkdownContent()));
            section.setRichTextContent(cleanupText(section.getRichTextContent()));
        }
    }
}
