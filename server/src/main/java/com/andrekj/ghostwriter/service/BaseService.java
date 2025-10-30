package com.andrekj.ghostwriter.service;

import com.andrekj.ghostwriter.exceptions.AIServiceException;
import com.andrekj.ghostwriter.exceptions.ContentGenerationException;
import com.andrekj.ghostwriter.interfaces.BaseResponse;
import com.google.genai.Client;
import com.andrekj.ghostwriter.interfaces.BaseRequest;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.ThinkingConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.lang.Math.ceil;
import static java.lang.Math.min;

@Slf4j
public abstract class BaseService {
    public static int MAX_RETRIES = 3;

    List<String> aiModels = List.of(
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
            "gemini-2.5-pro"
    );

    protected final Client geminiClient;

    protected BaseService(Client geminiClient) {
        this.geminiClient = geminiClient;
    }

    private static final Map<String, Integer> MODEL_DEFAULT_THINKING = Map.of(
            "gemini-2.5-flash-lite", 512,
            "gemini-2.5-flash", 1024,
            "gemini-2.5-pro", 2048
    );

    // Minimum thinking budgets per model
    private static final Map<String, Integer> MODEL_MIN_THINKING = Map.of(
            "gemini-2.5-flash-lite", 512,
            "gemini-2.5-flash", 0,
            "gemini-2.5-pro", 128
    );

    public static GenerateContentConfig buildConfig(BaseRequest request) {
        float temperature = switch (request.getContentType()) {
            case "blog" -> 0.7F;
            case "email" -> 0.5F;
            default -> 0.7F;
        };


        // Convert words → tokens
        int requestedWords = request.getWordCount();
        int targetTokens = (int) Math.ceil(requestedWords * 1.3);

        // Max & Min thinking budgets
        String aimodel = request.getAimodel();
        int maxThinking = MODEL_DEFAULT_THINKING.getOrDefault(aimodel, -1);
        int minThinking = MODEL_MIN_THINKING.getOrDefault(aimodel, 512);

        int thinkingBudget;
        if (maxThinking == -1) {
            thinkingBudget = -1; // dynamic thinking
        } else {
            // Cap thinking to 1/3 of desired output, but respect min/max
            //thinkingBudget = Math.max(minThinking, Math.min(maxThinking, targetTokens / 3));
            //thinkingBudget = (int) (targetTokens * 2 * 1.5);
            thinkingBudget = Math.max(maxThinking, targetTokens * 5);
        }

        // Total token budget = desired output + thinking budget
        int maxOutputTokens;
        if (thinkingBudget == -1) {
            maxOutputTokens = targetTokens + 512; // safe buffer for dynamic thinking
        } else {
            //maxOutputTokens = (int) (targetTokens * 1.5 + thinkingBudget);
            //maxOutputTokens = (int) (targetTokens * 5);
            maxOutputTokens = (int) (targetTokens * 1.5 + thinkingBudget);
        }

//        int maxOutputTokens = (int) (targetTokens * 1.5);
//        int thinkingBudget = (int) (maxOutputTokens * 1.5);

        ThinkingConfig thinkingConfig = ThinkingConfig.builder()
                .thinkingBudget(thinkingBudget)
                .includeThoughts(false)
                .build();

        System.out.println("\u001B[34m" + "MaxOutputTokens:" + "\u001B[0m" + maxOutputTokens);
        System.out.println("\u001B[34m" +  "Thinking budget:" + "\u001B[0m" + thinkingBudget + "\n");

        return GenerateContentConfig.builder()
                .temperature(temperature)
                .topP(0.9F)
                .maxOutputTokens(maxOutputTokens)
                .thinkingConfig(thinkingConfig)
                .build();
    }


    // todo automatically switch model if one of them fails
    protected GenerateContentResponse callAiAPI(
            BaseRequest request,
            String prompt,
            GenerateContentConfig config
    ) {
        GenerateContentResponse response;
        try {
            response = geminiClient.models.generateContent(
                    request.getAimodel(),
                    prompt,
                    config
            );
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "Unknown AI service error";

            if (msg.contains("400")) {
                throw new AIServiceException(msg, HttpStatus.BAD_REQUEST);
            } else if (msg.contains("402")) {
                throw new AIServiceException(msg, HttpStatus.FORBIDDEN);
            } else if (msg.contains("404")) {
                throw new AIServiceException(msg, HttpStatus.NOT_FOUND);
            } else if (msg.contains("429")) {
                throw new AIServiceException(msg, HttpStatus.TOO_MANY_REQUESTS);
            } else if (msg.contains("503")) {
                throw new AIServiceException(msg, HttpStatus.SERVICE_UNAVAILABLE);
            } else if (msg.contains("504")) {
                throw new AIServiceException(msg, HttpStatus.GATEWAY_TIMEOUT);
            } else {
                throw new AIServiceException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        System.out.println("\n" + "\u001B[34m" + "Response:" + "\u001B[0m" + response.text());
        System.out.println("\n" + "\u001B[34m" +  "Response tokens:" + "\u001B[0m \n" + response.usageMetadata() + "\n");

        // the gemini api sometimes just returns an empty response without an exception when the rate limit is exceeded or something else goes wrong
        if (response == null || response.text() == null || response.text().isBlank()) {
            throw new AIServiceException(
                    "Empty response from Gemini - likely rate limit exceeded",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        return response;
    }

    protected int countWords(String line) {
        return line.split(" ").length;
    }

    protected int calculateThinkingBudget(String aimodel, List<String> aiModels, int desiredOutputTokens) {
        int thinkingBudget;

        if (aiModels.contains(aimodel)) {
            thinkingBudget = switch (aimodel) {
                case "gemini-2.5-flash-lite" -> Math.min(512, (int)(desiredOutputTokens * 0.25));
                case "gemini-2.5-flash" -> Math.min(1024, (int)(desiredOutputTokens * 0.25));
                case "gemini-2.5-pro" -> Math.min(2048, (int)(desiredOutputTokens * 0.25));
                default -> -1;
            };
        } else {
            thinkingBudget = -1;
        }

        return thinkingBudget;
    }

    protected boolean validateWordCount(int desiredWordCount, int actualWordCount) {
        int lowerLimit = (int) Math.ceil(desiredWordCount * 0.7);
        int upperLimit = (int) Math.floor(desiredWordCount * 1.3);
        return actualWordCount >= lowerLimit && actualWordCount <= upperLimit;
    }

    protected String convertLineToPLainText(String line) {

        String plainLine = line
                .replaceAll("#+", "") // headers
                .replaceAll("\\*", "") // remove seo markers (bold) ("\\*\\*(.*?)\\*\\*", "$1")
                .replaceAll("_([^_]+)_", "$1") // italics
                .trim();

        return plainLine;
    }

    protected String cleanupText(String text) {
        if (text == null) return "";
        text = text.trim()
                .replaceAll("\\r\\n|\\r", "\n")
                .replaceAll("(?i)As an AI.*?\\.", "");
        return Arrays.stream(text.split("\n"))
                .map(String::stripTrailing)
                .collect(Collectors.joining("\n"));
    }

    protected String calculateReadtime(int wordCount) {
        int wordsPerMinute = 200;
        int minutes = (int) Math.ceil(wordCount / (double) wordsPerMinute);
        return (minutes + " min");
    }

    protected void handleTooManyRetriesError(String contentType, int retryCount, SimpMessagingTemplate messagingTemplate) {
        System.out.println("Too many retries");
        String payload = contentType.substring(0, 1).toUpperCase() + contentType.substring(1) + " generation failed after " + retryCount + " attempts.";
        messagingTemplate.convertAndSend("/topic/" + contentType + "-status", payload);
        throw new ContentGenerationException(payload);
    }


}
