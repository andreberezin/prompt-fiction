package com.andrekj.ghostwriter.service.ai;

import com.andrekj.ghostwriter.interfaces.BaseRequest;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.ThinkingConfig;
import java.util.Map;

public class ConfigBuilder {

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

    // todo for later use - have a dynamic thinking budget
//    protected int calculateThinkingBudget(String aimodel, List<String> aiModels, int desiredOutputTokens) {
//        int thinkingBudget;
//
//        if (aiModels.contains(aimodel)) {
//            thinkingBudget = switch (aimodel) {
//                case "gemini-2.5-flash-lite" -> Math.min(512, (int)(desiredOutputTokens * 0.25));
//                case "gemini-2.5-flash" -> Math.min(1024, (int)(desiredOutputTokens * 0.25));
//                case "gemini-2.5-pro" -> Math.min(2048, (int)(desiredOutputTokens * 0.25));
//                default -> -1;
//            };
//        } else {
//            thinkingBudget = -1;
//        }
//
//        return thinkingBudget;
//    }


    public static GenerateContentConfig build(BaseRequest request) {
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
            thinkingBudget = Math.max(maxThinking, targetTokens * 5);
        }

        // Total token budget = desired output + thinking budget
        int maxOutputTokens;
        if (thinkingBudget == -1) {
            maxOutputTokens = targetTokens + 512; // safe buffer for dynamic thinking
        } else {
            maxOutputTokens = (int) (targetTokens * 1.5 + thinkingBudget);
        }

        ThinkingConfig thinkingConfig = ThinkingConfig.builder()
                .thinkingBudget(thinkingBudget)
                .includeThoughts(false)
                .build();

//        System.out.println("\u001B[34m" + "MaxOutputTokens:" + "\u001B[0m" + maxOutputTokens);
//        System.out.println("\u001B[34m" +  "Thinking budget:" + "\u001B[0m" + thinkingBudget + "\n");

        return GenerateContentConfig.builder()
                .temperature(temperature)
                .topP(0.9F)
                .maxOutputTokens(maxOutputTokens)
                .thinkingConfig(thinkingConfig)
                .build();
    }
}
