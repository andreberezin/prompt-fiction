package com.andrekj.ghostwriter.service.email;

import com.andrekj.ghostwriter.dto.EmailRequest;
import com.andrekj.ghostwriter.dto.EmailResponse;

import java.util.ArrayList;
import java.util.List;

import static com.andrekj.ghostwriter.service.util.TextUtils.validateWordCount;

public class EmailValidator {

    public static List<String> validateResponse(EmailResponse emailResponse, EmailRequest emailRequest) {
        List<String> errors = new ArrayList<>();

        if (emailResponse == null || emailResponse.getContent() == null) return errors;

        List<EmailResponse.Section> sections = emailResponse.getSections();
        if (sections == null || sections.isEmpty()) {
            System.out.println("\u001B[31m" + "Validation failed: no sections found" + "\u001B[0m");
            return errors;
        }

        // validate word count
        boolean validWordCount = validateWordCount(emailRequest.getWordCount(), emailResponse.getMetadata().getWordCount());
        // validate subject
        boolean hasSubject = emailResponse.getSubject() != null && !emailResponse.getSubject().trim().isEmpty();
        // validate sections: 1 greeting, 1 body, 1 closing
        long greetingCount = sections.stream().filter(s -> "greeting".equalsIgnoreCase(s.getType())).count();
        long bodyCount = sections.stream().filter(s -> "body".equalsIgnoreCase(s.getType())).count();
        long closingCount = sections.stream().filter(s -> "closing and signature".equalsIgnoreCase(s.getType())).count();
        long ctaCount = sections.stream().filter(s -> "call to action".equalsIgnoreCase(s.getType())).count();
        // validate that all sections have content
        boolean allHaveText = sections.stream().allMatch(s -> s.getMarkdownContent() != null && !s.getMarkdownContent().isEmpty() &&
                s.getPlainTextContent() != null && !s.getPlainTextContent().isEmpty());

        boolean structureValid =
                hasSubject &&
                        greetingCount == 1 &&
                        bodyCount == 1 &&
                        closingCount == 1 &&
                        allHaveText;

        boolean hasCtaInRequest = emailRequest.getCta() != null && !emailRequest.getCta().isBlank();

        boolean overallValid = hasCtaInRequest
                ? validWordCount && structureValid && ctaCount == 1
                : validWordCount && structureValid;

        if (!overallValid) {
            System.out.println("\n" + "\u001B[31m" +  "Validation failed:"  + "\u001B[0m");

            if (!validWordCount) {
                System.out.println(" - Invalid word count: " + emailResponse.getMetadata().getWordCount());
                errors.add("Invalid word count");
            };

            if (!hasSubject) {
                System.out.println(" - Missing subject line");
                errors.add("Missing subject line");
            };

            if (greetingCount != 1) {
                System.out.println(" - Invalid number of greetings (" + greetingCount + ")");
                if (greetingCount > 1) errors.add("Too many ##Greeting sections, remove " + (greetingCount - 1));
                if (greetingCount < 1) errors.add("No ##Greeting sections found, add one");
            };
            if (bodyCount != 1) {
                System.out.println(" - Invalid number of body sections (" + bodyCount + ")");
                if (bodyCount > 1) errors.add("Too many ## body sections, remove " + (bodyCount - 1));
                if (bodyCount < 1) errors.add("No ## body sections found, add one");
            };
            if (closingCount != 1) {
                System.out.println(" - Invalid number of closing sections (" + closingCount + ")");
                if (closingCount > 1) errors.add("Too many ##Closing and signature sections, remove " + (closingCount - 1));
                if (closingCount < 1) errors.add("No ##Closing and signature sections found, add one");
            };
            if (ctaCount != 1 && hasCtaInRequest) {
                System.out.println(" - Invalid number of cta sections (" + ctaCount + ")");
                if (ctaCount > 1) errors.add("Too many ##Call to action sections, remove " + (ctaCount - 1));
                if (ctaCount < 1) errors.add("No ##Call to action sections found, add one");
            };
            // Catch all for any other structureValid failures not already logged
            if (!structureValid && greetingCount == 1 && bodyCount == 1 && closingCount == 1 && hasSubject && allHaveText) {
                System.out.println(" - Structure valid flags failed (unknown reason)");
                errors.add("Unknown structure validation failure");
            }

        } else {
            System.out.println("\n" + "\u001B[32m" +  "Response is valid" + "\u001B[0m");
        }

        return errors;
    }
}
