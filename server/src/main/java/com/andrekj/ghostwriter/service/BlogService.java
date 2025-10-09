package com.andrekj.ghostwriter.service;

import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;
import org.springframework.stereotype.Service;

@Service
public class BlogService {

    public BlogResponse generateBlogPost(BlogRequest request) {
        // 1. Normalize input (word count range, tone, etc.)
        normalizeInput(request);
        // 2. Build a prompt string based on request data
        String prompt = createPrompt(request);
        System.out.println(prompt);
        // 3. Call AI API (e.g., via WebClient or OkHttp)

        // 4. Process AI response (parse JSON or text)
        // 5. Return BlogResponse object
        return null;
    }

    private void normalizeInput(BlogRequest request) {
        request.setTopic(request.getTopic().trim().toLowerCase());
        request.setTargetAudience(request.getTargetAudience().trim().toLowerCase());
        request.setTone(request.getTone().trim().toLowerCase());
        request.setExpertiseLevel(request.getExpertiseLevel().trim().toLowerCase());
        request.setWordCount(Math.max(10, Math.min(request.getWordCount(), 2000)));
    }
     private String createPrompt(BlogRequest request) {
         return "You are an expert content writer specializing in " + request.getContentType() + "s.\n" +
                 "Write a " + request.getTone() + ", " + request.getExpertiseLevel() + "-level blog post about '" + request.getTopic() + "' for " +
                 request.getTargetAudience() + ".\n" +
                 "Requirements:\n" +
                 "- Target length: " + request.getWordCount() + " words\n" +
                 "- Tone: " + request.getTone() + "\n" +
                 "- Structure: Title, Introduction, 3-4 main sections, Conclusion\n" +
                 (request.isSeoFocus() ? "- Include SEO keywords\n" : "") +
                  "Format your response in Markdown.";
     }
}
