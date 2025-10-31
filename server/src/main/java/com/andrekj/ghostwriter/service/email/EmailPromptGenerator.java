package com.andrekj.ghostwriter.service.email;

import com.andrekj.ghostwriter.dto.EmailRequest;
import com.andrekj.ghostwriter.dto.EmailResponse;

import java.util.List;

public class EmailPromptGenerator {

    public static String generateEmailPrompt(EmailRequest request) {
        int minWordCount = (int) (request.getWordCount() * 0.9); // because the valid range is -10% to +10% and gemini keeps overshooting it
        int maxWordCount = (int) (request.getWordCount() * 1.10);

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
               Format the email using Markdown with one of each of these sections and include the following headings:
                - # Subject line
                - ## Greeting
                - ## Body
                - ## Closing and signature
                Output only the formatted email in Markdown, without commentary.
               \s""",
                minWordCount,
                maxWordCount);

        String prompt = basePrompt + recipientContext + keyPoints + ctaPart + structurePart;
//        System.out.println("\n" + "\u001B[34m" + "Prompt: \n" + prompt + "\u001B[0m \n");
        return prompt;
    }

    // todo part of this block of code is duplicated between emailservice and blogservice. Potential to have a shared function in baseservice.
    public static String regenerateEmailPrompt(EmailRequest request, EmailResponse previousResponse, List<String> validationErrors) {
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
                - It follows the structure and includes one of each of the following headings:
                    - # Subject line
                    - ## Greeting
                    - ## Body
                    - ## Closing and signature
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
//        System.out.println("\n" + "\u001B[34m" + "New prompt: \n" + prompt + "\u001B[0m \n");
        return prompt;
    }
}
