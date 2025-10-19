package com.andrekj.ghostwriter.service;

import com.andrekj.ghostwriter.exceptions.AIServiceException;
import com.andrekj.ghostwriter.interfaces.BaseResponse;
import com.google.genai.Client;
import com.andrekj.ghostwriter.interfaces.BaseRequest;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.ThinkingConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

import static java.lang.Math.ceil;
import static java.lang.Math.min;

@Slf4j
public abstract class BaseService {

    List<String> aiModels = List.of(
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
            "gemini-2.5-pro"
    );

    protected final Client geminiClient;

    protected BaseService(Client geminiClient) {
        this.geminiClient = geminiClient;
    }

//    public GenerateContentConfig buildConfig(BaseRequest request) {
//        float temperature = switch (request.getContentType()) {
//            case "blog" -> 0.7F;
//            case "email" -> 0.5F;
//            default -> 0.7F;
//        };
//
//        //int maxTokens = (int) Math.min((int) (request.getWordCount() * 1.1) * 0.75, 5000);
//        int desiredOutputTokens = (int) (ceil(request.getWordCount() / 0.75) * 1.1);
//        System.out.println("\n" + "\u001B[32m" + "DesiredOutputTokens:" + desiredOutputTokens + "\u001B[0m");
//
//        //int thinkingBudget = min(0.25 * maxTokens, model_max_thinking_budget);
//        int thinkingBudget = calculateThinkingBudget(request.getAimodel(), aiModels, desiredOutputTokens);
//        int maxOutputTokens = desiredOutputTokens + thinkingBudget;
//        System.out.println("\u001B[32m" + "MaxOutputTokens:" + maxOutputTokens + "\u001B[0m");
//
//        ThinkingConfig thinkingConfig = ThinkingConfig.builder()
//                .thinkingBudget(thinkingBudget)
//                .includeThoughts(false)
//                .build();
//
//        return GenerateContentConfig.builder()
//                .temperature(temperature)
//                .topP(0.9F)
//                .maxOutputTokens(maxOutputTokens)
//                .thinkingConfig(thinkingConfig)
//                .build();
//    }


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

        int requestedWords = request.getWordCount();
        String aimodel = request.getAimodel();

        // Convert words → tokens
        int desiredOutputTokens = (int) Math.ceil(requestedWords / 0.75);

        // Max & Min thinking budgets
        int maxThinking = MODEL_DEFAULT_THINKING.getOrDefault(aimodel, -1);
        int minThinking = MODEL_MIN_THINKING.getOrDefault(aimodel, 512);

        int thinkingBudget;
        if (maxThinking == -1) {
            thinkingBudget = -1; // dynamic thinking
        } else {
            // Cap thinking to 1/3 of desired output, but respect min/max
            thinkingBudget = Math.max(minThinking, Math.min(maxThinking, desiredOutputTokens / 3));
        }

        // Total token budget = desired output + thinking budget
        int maxOutputTokens;
        if (thinkingBudget == -1) {
            maxOutputTokens = desiredOutputTokens + 512; // safe buffer for dynamic thinking
        } else {
            maxOutputTokens = desiredOutputTokens + thinkingBudget;
        }

        ThinkingConfig thinkingConfig = ThinkingConfig.builder()
                .thinkingBudget(thinkingBudget)
                .includeThoughts(false)
                .build();

        System.out.println("\n" + "\u001B[32m" + "MaxOutputTokens:" + "\u001B[0m" + maxOutputTokens);
        System.out.println("\n" + "\u001B[32m" +  "Thinking budget:" + "\u001B[0m" + thinkingBudget + "\n");

        return GenerateContentConfig.builder()
                .temperature(temperature)
                .topP(0.9F)
                .maxOutputTokens(maxOutputTokens)
                .thinkingConfig(thinkingConfig)
                .build();
    }


    // todo empty response with gemini-2.5-pro and gemini-2.5-flash
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
        System.out.println("\n" + "\u001B[32m" + "Response:" + "\u001B[0m \n" + response.text());
        System.out.println("\n" + "\u001B[32m" +  "Response tokens:" + "\u001B[0m \n" + response.usageMetadata() + "\n");

        // the gemini api sometimes just returns an empty response without an exception when the rate limit is exceeded or something else goes wrong
        if (response == null || response.text() == null || response.text().isBlank()) {
            throw new AIServiceException(
                    "Empty response from Gemini - likely rate limit exceeded",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        return response;
    }

    // todo maybe not needed? Haven't seen gemini produce these artifacts yet
    protected void cleanUpAiArtifacts(BaseResponse response) {

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
        System.out.println("Desired word count: " + desiredWordCount);
        System.out.println("Actual word count: " + actualWordCount);
        int lowerLimit = (int) Math.ceil(desiredWordCount * 0.9);
        int upperLimit = (int) Math.floor(desiredWordCount * 1.1);
        System.out.println("Lower: " + lowerLimit);
        System.out.println("Upper: " + upperLimit);
        return actualWordCount >= lowerLimit && actualWordCount <= upperLimit;
    }

}
