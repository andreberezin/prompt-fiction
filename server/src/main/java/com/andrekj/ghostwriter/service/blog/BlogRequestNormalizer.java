package com.andrekj.ghostwriter.service.blog;

import com.andrekj.ghostwriter.dto.BlogRequest;

public class BlogRequestNormalizer {
    public static void normalize(BlogRequest request) {
        request.setTopic(request.getTopic().trim().toLowerCase());
        request.setTargetAudience(request.getTargetAudience().trim().toLowerCase());
        request.setTone(request.getTone().trim().toLowerCase());
        request.setExpertiseLevel(request.getExpertiseLevel().trim().toLowerCase());
        request.setWordCount(Math.max(100, Math.min(request.getWordCount(), 2000)));
    }
}
