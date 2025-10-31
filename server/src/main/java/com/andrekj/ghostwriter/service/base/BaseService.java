package com.andrekj.ghostwriter.service.base;
import com.andrekj.ghostwriter.exceptions.ContentGenerationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.List;

@Slf4j
public abstract class BaseService {
    public static int MAX_RETRIES = 5;

    List<String> aiModels = List.of(
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
            "gemini-2.5-pro"
    );


    protected void handleTooManyRetriesError(String contentType, int retryCount, SimpMessagingTemplate messagingTemplate) {
        log.error("Too many retries for {} after {} attempts", contentType, retryCount);
        String payload = contentType.substring(0, 1).toUpperCase() + contentType.substring(1) + " generation failed after " + retryCount + " attempts.";
        messagingTemplate.convertAndSend("/topic/" + contentType + "-status", payload);
        throw new ContentGenerationException(payload);
    }
}
