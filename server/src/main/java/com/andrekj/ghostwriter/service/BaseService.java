package com.andrekj.ghostwriter.service;

import com.andrekj.ghostwriter.exceptions.AIServiceException;
import com.andrekj.ghostwriter.interfaces.BaseResponse;
import com.google.genai.Client;
import com.andrekj.ghostwriter.interfaces.BaseRequest;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;

@Slf4j
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
        System.out.println("Response: \n" + response);

        // the gemini api sometimes just returns an empty response without an exception when the rate limit is exceeded or something else goes wrong
        if (response == null || response.text() == null || response.text().isBlank()) {
            throw new AIServiceException(
                    "Empty response from Gemini - likely rate limit exceeded",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        return response;
    }

    protected void processResponse(BaseResponse response) {
        cleanUpAiArtifacts(response);
    }

    protected void cleanUpAiArtifacts(BaseResponse response) {

    }
}
