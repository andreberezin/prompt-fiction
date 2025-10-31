package com.andrekj.ghostwriter.service.email;

import com.andrekj.ghostwriter.dto.EmailRequest;

public class EmailRequestNormalizer {

    public static void normalize(EmailRequest request) {
        request.setPurpose(request.getPurpose().trim().toLowerCase());
        request.setTone(request.getTone().trim().toLowerCase());
        request.setRecipientContext(request.getRecipientContext().trim().toLowerCase());
        request.setUrgencyLevel(request.getUrgencyLevel().trim().toLowerCase());
        request.setCta(request.getCta().trim().toLowerCase());
        request.setKeyPoints(request.getKeyPoints().trim().toLowerCase());
        request.setWordCount(Math.max(50, Math.min(request.getWordCount(), 500)));
    }
}
