package com.andrekj.ghostwriter.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;
import org.springframework.stereotype.Service;

@Service
public class BlogService extends BaseService {
    public BlogService(Client geminiClient) {
        super(geminiClient);
    }

//    private final Client geminiClient;

//    public BlogService(Client geminiClient) {
//        this.geminiClient = geminiClient;
//    }

    public BlogResponse generateBlogPost(BlogRequest request) {
        // 1. Normalize input (word count range, tone, etc.)
        normalizeBlogInput(request);

        // 2. Build a prompt string based on request data
        String prompt = createBlogPrompt(request);

        // 3. Call AI API
        GenerateContentConfig config = buildConfig(request);
        GenerateContentResponse response = callAiAPI(request, prompt, config);

        // 4. Process AI response (parse JSON or text)
        BlogResponse blogResponse = new BlogResponse();
        processResponse(blogResponse, response);

        // 5. Return BlogResponse object
        return blogResponse;
    }

    private void normalizeBlogInput(BlogRequest request) {
        request.setTopic(request.getTopic().trim().toLowerCase());
        request.setTargetAudience(request.getTargetAudience().trim().toLowerCase());
        request.setTone(request.getTone().trim().toLowerCase());
        request.setExpertiseLevel(request.getExpertiseLevel().trim().toLowerCase());
        request.setWordCount(Math.max(10, Math.min(request.getWordCount(), 2000)));
    }


     private String createBlogPrompt(BlogRequest request) {
        String sectionCount = "3-4";

         return "You are an expert content writer specializing in " + request.getContentType() + "s.\n" +
                 "Write a " + request.getTone() + ", " + request.getExpertiseLevel() + "-level " + request.getContentType() + " about '" + request.getTopic() + "' for " +
                 request.getTargetAudience() + ".\n" +
                 "Requirements:\n" +
                 "- Target length: " + request.getWordCount() + " words\n" +
                 "- Tone: " + request.getTone() + "\n" +
                 "- Structure: Title, Introduction, " + sectionCount + " main sections, Conclusion\n" +
                 (request.isSeoFocus() ? "- Include SEO keywords\n" : "") +
                  "Format your response in Markdown.";
     }

     private void processResponse(BlogResponse blogResponse, GenerateContentResponse rawResponse) {
         blogResponse.setContent(rawResponse.text());

         // set title
         // set sections
         // get word count
         // get keywords if needed
     }
}
