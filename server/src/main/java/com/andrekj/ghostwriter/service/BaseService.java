package com.andrekj.ghostwriter.service;

import com.andrekj.ghostwriter.interfaces.BaseResponse;
import com.google.genai.Client;
import com.andrekj.ghostwriter.interfaces.BaseRequest;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;

public abstract class BaseService {

    protected final Client geminiClient;

    protected BaseService(Client geminiClient) {
        this.geminiClient = geminiClient;
    }

    public GenerateContentConfig buildConfig(BaseRequest request) {
        float temperature = (float) switch (request.getContentType()) {
            case "blog" -> 0.7;
            case "email" -> 0.5;
            default -> 0.7;
        };

        return GenerateContentConfig.builder()
                .temperature(temperature)
                .topP(0.9F)
                .maxOutputTokens((int) Math.min((int) request.getWordCount() * 1.3, 2000))
                .build();
    }

    protected GenerateContentResponse callAiAPI(
            BaseRequest request,
            String prompt,
            GenerateContentConfig config
    ) {
        try {
            return geminiClient.models.generateContent(
                    request.getAimodel(),
                    prompt,
                    config
            );
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return null;
        }
    }

    protected void processResponse(BaseResponse response) {

    }
}
