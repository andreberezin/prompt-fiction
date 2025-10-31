package com.andrekj.ghostwriter.service.blog;

import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;

import java.util.ArrayList;
import java.util.List;

import static com.andrekj.ghostwriter.service.util.TextUtils.validateWordCount;

public class BlogValidator {

    public static List<String> validate(BlogResponse blogResponse, BlogRequest blogRequest) {
        List<String> errors = new ArrayList<>();

        if (blogResponse == null || blogResponse.getContent() == null) return errors;

        List<BlogResponse.Section> sections = blogResponse.getSections();
        if (sections == null || sections.isEmpty()) {
            System.out.println("\u001B[31m" + "Validation failed: no sections found" + "\u001B[0m");
            return errors;
        }

        // validate word count
        boolean validWordCount = validateWordCount(blogRequest.getWordCount(), blogResponse.getMetadata().getWordCount());

        // validate title
        boolean hasTitle = blogResponse.getTitle() != null && !blogResponse.getTitle().trim().isEmpty();

        // validate structure
        boolean firstIsIntro = sections.getFirst().getType().equalsIgnoreCase("introduction");
        boolean lastIsConclusion = sections.getLast().getType().equalsIgnoreCase("conclusion");

        // count sections
        long introCount = sections.stream().filter(s -> "introduction".equalsIgnoreCase(s.getType())).count();
        long bodyCount = sections.stream().filter(s -> "body".equalsIgnoreCase(s.getType())).count();
        long conclusionCount = sections.stream().filter(s -> "conclusion".equalsIgnoreCase(s.getType())).count();

        // validate content
        boolean allHaveText = sections.stream().allMatch(s -> s.getMarkdownContent() != null && !s.getMarkdownContent().isEmpty() &&
                s.getPlainTextContent() != null && !s.getPlainTextContent().isEmpty());

        boolean allBodyHaveTitle = sections.stream()
                .filter(s -> "body".equalsIgnoreCase(s.getType()))
                .allMatch(s -> s.getTitle() != null && !s.getTitle().isBlank());

        boolean structureValid =
                firstIsIntro &&
                        lastIsConclusion &&
                        introCount == 1 &&
                        conclusionCount == 1 &&
                        bodyCount >= 2 &&
                        bodyCount <= 4 &&
                        allHaveText &&
                        allBodyHaveTitle;

        boolean overallValid = validWordCount && hasTitle && structureValid;

        if (!overallValid) {
            System.out.println("\n" + "\u001B[31m" +  "Validation failed:"  + "\u001B[0m");

            if (!validWordCount) {
                System.out.println(" - Invalid word count: " + blogResponse.getMetadata().getWordCount());
                errors.add("Invalid word count");
            };

            if (!hasTitle) {
                System.out.println(" - Missing main title");
                errors.add("Missing title");
            };

            if (!firstIsIntro) {
                System.out.println(" - First section is not introduction");
                errors.add("First section is not ##Introduction");
            };
            if (!lastIsConclusion) {
                System.out.println(" - Last section is not conclusion");
                errors.add("Last section is not ##Conclusion");
            };
            if (introCount != 1) {
                System.out.println(" - Invalid number of introductions (" + introCount + ")");
                errors.add("Invalid number of ##Introductions, need one");
            };
            if (conclusionCount != 1) {
                System.out.println(" - Invalid number of conclusions (" + conclusionCount + ")");
                errors.add("Invalid number of ##Conclusions, need one");
            };
            if (bodyCount < 1) {
                System.out.println(" - No body sections found");
                errors.add("No body sections found");
            };
            if (!allHaveText) {
                System.out.println(" - Some sections have no content");
                errors.add("Some sections have no content");
            };
            if (!allBodyHaveTitle) {
                System.out.println(" - Some body sections have no titles");
                errors.add("Some body sections have no titles");
            };
        } else {
            System.out.println("\n" + "\u001B[32m" +  "Response is valid" + "\u001B[0m");
        }

        return errors;
    }
}
