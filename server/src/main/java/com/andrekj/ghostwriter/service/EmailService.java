package com.andrekj.ghostwriter.service;
import com.andrekj.ghostwriter.dto.BlogResponse;
import com.andrekj.ghostwriter.dto.EmailRequest;
import com.andrekj.ghostwriter.dto.EmailResponse;
import com.andrekj.ghostwriter.exceptions.ContentGenerationException;
import com.google.genai.Client;

import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

@Service
public class EmailService extends BaseService {

    private final PDFGeneratorService pdfGeneratorService;
    private final SimpMessagingTemplate messagingTemplate;

    public EmailService(Client geminiClient, PDFGeneratorService pdfGeneratorService, SimpMessagingTemplate simpMessagingTemplate) {super(geminiClient);
        this.pdfGeneratorService = pdfGeneratorService;
        this.messagingTemplate = simpMessagingTemplate;
    }

    public EmailResponse generateEmail(EmailRequest request, int attempt) {

        if (attempt == 1) messagingTemplate.convertAndSend("/topic/email-status", "Generating email...");

        // gemini-2.5-pro has max 2 requests per minute on free tier
        if (request.getAimodel().equalsIgnoreCase("gemini-2.5-pro")) MAX_RETRIES = 2;

        // 1. Normalize input
        normalizeEmailRequest(request);

        // 1.5 Prepare for prompt building and validation
        String prompt = null;
        EmailResponse emailResponse = null;
        List<String> validationErrors = new ArrayList<>();
        int currentAttempt = attempt;

        // 2. Build the prompt
        for (; currentAttempt <= MAX_RETRIES; currentAttempt++) {
            messagingTemplate.convertAndSend("/topic/email-retry", "Starting generation...");
            if (currentAttempt == 1) { // 2.1 regular prompt
                prompt = generateEmailPrompt(request);
            } else { // 2.2 Regenerate prompt based on last response and errors
                prompt = regenerateEmailPrompt(request, emailResponse, validationErrors);
                messagingTemplate.convertAndSend("/topic/email-status", "Generated email was not up to code. Retrying...");
            }

            // 3. Build config and call the AI api
            GenerateContentConfig config = buildConfig(request);
            GenerateContentResponse response = callAiAPI(request, prompt, config);

            // 4. Process the response
            emailResponse = new EmailResponse();
            processResponse(emailResponse, response.text());
            //emailResponse.setAttempts(currentAttempt);

            // 5. Validate the response
            validationErrors = validateResponse(emailResponse, request);
            if (validationErrors.isEmpty()) {
                break;
            }
        }

        if (!validationErrors.isEmpty()) {
            handleTooManyRetriesError("blog", MAX_RETRIES, messagingTemplate);
        }

        assert emailResponse != null : "The response is empty";
        // 6. Clean up response
        cleanupResponse(emailResponse);

        // 7. Prepare the pdf format
        preparePdfFormat(emailResponse);

        return emailResponse;
    }

    private void normalizeEmailRequest(EmailRequest request) {
        request.setPurpose(request.getPurpose().trim().toLowerCase());
        request.setTone(request.getTone().trim().toLowerCase());
        request.setRecipientContext(request.getRecipientContext().trim().toLowerCase());
        request.setUrgencyLevel(request.getUrgencyLevel().trim().toLowerCase());
        request.setCta(request.getCta().trim().toLowerCase());
        request.setKeyPoints(request.getKeyPoints().trim().toLowerCase());
        request.setWordCount(Math.max(50, Math.min(request.getWordCount(), 500)));
    }

    private String generateEmailPrompt(EmailRequest request) {
        int minWordCount = (int) (request.getWordCount() * 0.90); // because the valid range is -10% to +10% and gemini keeps overshooting it
        int maxWordCount = (int) (request.getWordCount() * 1.10);

//        String prompt = "You are an expert email copywriter.\n" +
//                "Write a " + request.getTone() + " email with a sense of";

//        String prompt = `You are an expert email copywriter.\n Write a request.getTone() email with a sense of`;

        String basePrompt = String.format("""
                        You are en expert email copywriter.
                        Write a %s email with a sense of %s urgency.
                        This email's purpose is: %s.
                        """,
                request.getTone(),
                request.getUrgencyLevel(),
                request.getPurpose());

        String recipientContext = !request.getRecipientContext().isBlank()
                ? String.format("Recipient context: %s.%n", request.getRecipientContext())
                : "";

        String keyPoints = !request.getKeyPoints().isBlank()
                ? String.format("Key points to include: %s.%n", request.getKeyPoints())
                : "";

        String ctaPart = !request.getCta().isBlank()
                ? String.format("End the email with a clear ##Call to action: %s.%n", request.getCta())
                : "";

        String structurePart = String.format("""
               Target length: between %d and %d words excluding the markdown headings. Do not exceed this limit.
               Format the email using Markdown with these sections:
                - 1 # Subject line
                - 1 ## Greeting
                - 1 ## Body
                - 1 ## Closing and signature
                Output only the formatted email in Markdown, without commentary.
               \s""",
                minWordCount,
                maxWordCount);

        String prompt = basePrompt + recipientContext + keyPoints + ctaPart + structurePart;
        System.out.println("\n" + "\u001B[34m" + "Prompt: \n" + prompt + "\u001B[0m \n");
        return prompt;
    }

    // todo part of this block of code is duplicated between emailservice and blogservice. Potential to have a shared function in baseservice.
    private String regenerateEmailPrompt(EmailRequest request, EmailResponse previousResponse, List<String> validationErrors) {
        String reasons = validationErrors.isEmpty() ? "The previous response was invalid" : String.join(", ", validationErrors);
        int minWordCount = (int) (request.getWordCount() * 0.90); // because the valid range is -10% to +10% and gemini keeps overshooting it
        int maxWordCount = (int) (request.getWordCount() * 1.10);

        int prevWordCount = previousResponse.getMetadata().getWordCount();
        String adjustAction = prevWordCount > maxWordCount ? "remove" : "add";
        int wordsToAdjust = Math.abs(prevWordCount - request.getWordCount());

        String previousPromptPart = previousResponse.getContent();

        String validationErrorsPart = String.format("""
                It did not meed the validation requirements because: %s
                """,
                reasons);

        String requirementsPart = String.format("""
                Regenerate the blog so that:
                - It follows the structure:
                    - 1 # Subject line
                    - 1 ## Greeting
                    - 1 ## Body
                    - 1 ## Closing and signature
                - the total word count must be between %d and %d
                The previous version had %d words excluding the markdown headings, so %s approximately %d word
                - The tone, sense of urgency, recipient context and key points remain the same.
                - Return  markdown only, no explanations.
                """,
                minWordCount,
                maxWordCount,
                prevWordCount,
                adjustAction,
                wordsToAdjust
        );

        String ctaPart = String.format("""
                End the email with a clear ##Call to action: %s.%n"
                """,
                request.getCta()
                );

        String prompt = previousPromptPart +  validationErrorsPart + requirementsPart + (!request.getCta().isBlank() ? ctaPart : "");
        System.out.println("\n" + "\u001B[34m" + "New prompt: \n" + prompt + "\u001B[0m \n");
        return prompt;
    }

    private void processResponse(EmailResponse emailResponse, String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) return;
        emailResponse.setContent(rawResponse);
        structureParsing(emailResponse, rawResponse);
    }

    private void structureParsing(EmailResponse emailResponse, String rawResponse) {
        assert rawResponse != null;
        String[] lines = rawResponse.split("\n");

        String currentSectionTitle = null;
        String currentSectionType = "subject";
        StringBuilder currentSectionMarkdownContent = new StringBuilder();
        StringBuilder currentSectionPlainTextContent = new StringBuilder();
        List<EmailResponse.Section> sections = new ArrayList<>();

        EmailResponse.Metadata metadata = new EmailResponse.Metadata();
        StringBuilder plainTextBuilder = new StringBuilder();

        int blankLineCount = 0;

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

            if (cleanLine.startsWith("##")) {
                // exclude the section titles for email plain text content
                //plainTextBuilder.append("\n").append(plainLine).append("\n");

                if (currentSectionType != null && !currentSectionMarkdownContent.isEmpty()) {
                    EmailResponse.Section section = new EmailResponse.Section();
                    section.setType(currentSectionType);
                    section.setTitle(currentSectionTitle);
                    section.setMarkdownContent(currentSectionMarkdownContent.toString().trim());
                    section.setPlainTextContent(currentSectionPlainTextContent.toString().trim());
                    sections.add(section);
                }

                currentSectionTitle = cleanLine.substring(2).trim();

                if (currentSectionTitle != null) {
                    String lower = currentSectionTitle.toLowerCase();
                    if (lower.contains("subject") || lower.contains("intro")) {
                        currentSectionType = "subject";
                    } else if (lower.contains("greeting")) {
                        currentSectionType = "greeting";
                    } else if (lower.contains("closing") || lower.contains("signature")) {
                        currentSectionType = "closing";
                    } else if (lower.contains("cta") || lower.contains("call to action")) {
                        currentSectionType = "cta";
                    } else {
                        currentSectionType = "body";
                    }
                }

                currentSectionMarkdownContent = new StringBuilder();
                currentSectionPlainTextContent = new StringBuilder();
            } else if (cleanLine.startsWith("#")) {
                emailResponse.setSubject(line.substring(1).trim());

                //exclude the section titles for email plain text content
                if (!plainLine.startsWith("Subject")) {
                    plainTextBuilder.append("\n").append(plainLine).append("\n\n");
                }
            } else {
                metadata.setWordCount(metadata.getWordCount() + countWords(plainLine));

                plainTextBuilder.append(plainLine).append("\n");

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

        emailResponse.setSections(sections);
        emailResponse.setMetadata(metadata);
        emailResponse.setExportFormats(exportFormats);
    }

    private void cleanupResponse(EmailResponse emailResponse) {
        List<EmailResponse.Section> sections = emailResponse.getSections();
        for (EmailResponse.Section section : sections) {
            section.setPlainTextContent(cleanupText(section.getPlainTextContent()));
            section.setMarkdownContent(cleanupText(section.getMarkdownContent()));
            section.setRichTextContent(cleanupText(section.getRichTextContent()));
        }
    }

    public EmailResponse updateEmailResponse(EmailResponse editedResponse) {
        String markdown = editedResponse.getExportFormats().getMarkdown();
        if (markdown == null || markdown.trim().isEmpty()) {
            return new EmailResponse(
                    "",
                    "",
                    Collections.emptyList(),
                    new EmailResponse.Metadata(0, "0 min"),
                    new EmailResponse.ExportFormats("", "", "", false),
                    ""
            );
        }

        EmailResponse updatedResponse = new EmailResponse();
        processResponse(updatedResponse, editedResponse.getExportFormats().getMarkdown());
        preparePdfFormat(updatedResponse);

        return updatedResponse;
    }

    private List<String> validateResponse(EmailResponse emailResponse, EmailRequest emailRequest) {
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
        // validate body
        //boolean hasBody = emailResponse.getBody() != null && !emailResponse.getBody().trim().isEmpty();
        // validate sections: 1 greeting, 1 body, 1 closing
        long greetingCount = sections.stream().filter(s -> "greeting".equalsIgnoreCase(s.getType())).count();
        long bodyCount = sections.stream().filter(s -> "body".equalsIgnoreCase(s.getType())).count();
        long closingCount = sections.stream().filter(s -> "closing".equalsIgnoreCase(s.getType())).count();
        long ctaCount = sections.stream().filter(s -> "cta".equalsIgnoreCase(s.getType())).count();
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
                // validWordCount && structureValid && (!hasCtaInRequest || ctaCount == 1);

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

        } else {
            System.out.println("\n" + "\u001B[32m" +  "Response is valid" + "\u001B[0m");
        }

        return errors;
    }

    private void preparePdfFormat(EmailResponse emailResponse) {
        byte[] pdfBytes = pdfGeneratorService.generateEmailPDF(emailResponse);
        emailResponse.getExportFormats().setPdfReady(true);
    }
}
