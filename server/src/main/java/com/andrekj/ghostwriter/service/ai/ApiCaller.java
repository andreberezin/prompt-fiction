package com.andrekj.ghostwriter.service.ai;

import com.andrekj.ghostwriter.exceptions.AIServiceException;
import com.andrekj.ghostwriter.interfaces.BaseRequest;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class ApiCaller {

    private final Client geminiClient;

    public ApiCaller(Client geminiClient) {
        this.geminiClient = geminiClient;
    }

    // todo automatically switch model if one of them fails
    public GenerateContentResponse call(
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
//        System.out.println("\n" + "\u001B[34m" + "Response:" + "\u001B[0m" + response.text());
//        System.out.println("\n" + "\u001B[34m" +  "Response tokens:" + "\u001B[0m \n" + response.usageMetadata() + "\n");

        // the gemini api sometimes just returns an empty response without an exception when the rate limit is exceeded or something else goes wrong
        if (response == null || response.text() == null || response.text().isBlank()) {
            throw new AIServiceException(
                    "Oops! Empty response from Gemini",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        return response;
    }
}
