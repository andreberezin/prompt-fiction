package com.andrekj.ghostwriter.service.email;
import com.andrekj.ghostwriter.dto.EmailRequest;
import com.andrekj.ghostwriter.dto.EmailResponse;
import com.andrekj.ghostwriter.service.ai.ApiCaller;
import com.andrekj.ghostwriter.service.ai.ConfigBuilder;
import com.andrekj.ghostwriter.service.base.BaseService;
import com.andrekj.ghostwriter.service.util.PDFGenerator;

import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EmailService extends BaseService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ApiCaller apiCaller;

    public EmailService(SimpMessagingTemplate simpMessagingTemplate,ApiCaller apiCaller) {
        this.messagingTemplate = simpMessagingTemplate;
        this.apiCaller = apiCaller;
    }

    public EmailResponse generateEmail(EmailRequest request, int attempt) {

        if (attempt == 1) messagingTemplate.convertAndSend("/topic/email-status", "Generating email...");

        // gemini-2.5-pro has max 2 requests per minute on free tier
        if (request.getAimodel().equalsIgnoreCase("gemini-2.5-pro")) MAX_RETRIES = 2;

        // 1. Normalize input
        EmailRequestNormalizer.normalize(request);

        // 1.5 Prepare for prompt building and validation
        String prompt = null;
        EmailResponse emailResponse = null;
        List<String> validationErrors = new ArrayList<>();
        int currentAttempt = attempt;

        // 2. Build the prompt
        for (; currentAttempt <= MAX_RETRIES; currentAttempt++) {
            messagingTemplate.convertAndSend("/topic/email-retry", "Starting generation...");
            if (currentAttempt == 1) { // 2.1 regular prompt
                prompt = EmailPromptGenerator.generateEmailPrompt(request);
            } else { // 2.2 Regenerate prompt based on last response and errors
                prompt = EmailPromptGenerator.regenerateEmailPrompt(request, emailResponse, validationErrors);
                messagingTemplate.convertAndSend("/topic/email-status", "Generated email was not up to code. Retrying...");
            }

            // 3. Build config and call the AI api
            GenerateContentConfig config = ConfigBuilder.build(request);
            GenerateContentResponse response = apiCaller.call(request, prompt, config);

            // 4. Process the response
            emailResponse = new EmailResponse();
            processResponse(emailResponse, response.text());
            //emailResponse.setAttempts(currentAttempt);

            // 5. Validate the response
            validationErrors = EmailValidator.validateResponse(emailResponse, request);
            if (validationErrors.isEmpty()) {
                break;
            }
        }

        if (!validationErrors.isEmpty()) {
            handleTooManyRetriesError("email", MAX_RETRIES, messagingTemplate);
        }

        assert emailResponse != null : "The response is empty";
        // 6. Clean up response
        EmailSanitizer.clean(emailResponse);

        // 7. Prepare the pdf format
        PDFGenerator.prepareForEmail(emailResponse);

        return emailResponse;
    }


    private void processResponse(EmailResponse emailResponse, String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) return;
        emailResponse.setContent(rawResponse);
        EmailStructurer.structure(emailResponse, rawResponse);
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
        PDFGenerator.prepareForEmail(updatedResponse);

        return updatedResponse;
    }
}
