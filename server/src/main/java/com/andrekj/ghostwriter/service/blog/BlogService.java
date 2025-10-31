package com.andrekj.ghostwriter.service.blog;
import com.andrekj.ghostwriter.service.ai.ApiCaller;
import com.andrekj.ghostwriter.service.ai.ConfigBuilder;
import com.andrekj.ghostwriter.service.base.BaseService;
import com.andrekj.ghostwriter.service.util.PDFGenerator;
import com.google.genai.types.*;
import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BlogService extends BaseService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ApiCaller apiCaller;

    public BlogService (SimpMessagingTemplate messagingTemplate, ApiCaller apiCaller) {
        this.messagingTemplate = messagingTemplate;
        this.apiCaller = apiCaller;
    }

    public BlogResponse generateBlog(BlogRequest request, int attempt) {
        if (attempt == 1) messagingTemplate.convertAndSend("/topic/blog-status", "Generating blog...");


        // gemini-2.5-pro has max 2 requests per minute on free tier
        if (request.getAimodel().equalsIgnoreCase("gemini-2.5-pro")) MAX_RETRIES = 2;

        // 1. Normalize input (word count range, tone, etc.)
        BlogRequestNormalizer.normalize(request);

        // 1.5 prepare for prompt building and validation
        String prompt = null;
        BlogResponse blogResponse = null;
        List<String> validationErrors = new ArrayList<>();
        int currentAttempt = attempt;

            // 2. build the prompt
            for (; currentAttempt <= MAX_RETRIES; currentAttempt++) {
                messagingTemplate.convertAndSend("/topic/blog-retry", "Starting generation...");
                if (currentAttempt == 1) { // 2.1 regular prompt
                    prompt = BlogPromptGenerator.generateBlogPrompt(request);
                } else { // 2.2 Regenerate prompt based on last response and errors
                    prompt = BlogPromptGenerator.regenerateBlogPrompt(request, blogResponse, validationErrors);
//                    System.out.println("Retrying blog generation (attempt " + currentAttempt + ")\n");
                    messagingTemplate.convertAndSend("/topic/blog-status", "Generated content was not up to code. Retrying...");
                }

                // 3. Build config and call the AI api
                GenerateContentConfig config = ConfigBuilder.build(request);
                GenerateContentResponse response = apiCaller.call(request, prompt, config);

                // 4. Process the response
                blogResponse = new BlogResponse();
                processResponse(blogResponse, response.text());
                blogResponse.setAttempts(currentAttempt);

                // 5. Validate response
                validationErrors = BlogValidator.validate(blogResponse, request);
                if (validationErrors.isEmpty()) {
                    // Valid response, break and continue to clean up
                    break;
                }
            }

            if (!validationErrors.isEmpty()) {
                handleTooManyRetriesError("blog", MAX_RETRIES, messagingTemplate);
            }

            assert blogResponse != null : "The response is empty";
            // 6. clean up response
            BlogSanitizer.clean(blogResponse);

            // 7. Prepare pdf format
            PDFGenerator.generateBlogPDF(blogResponse);

            // return response object
            return blogResponse;
    }

     private void processResponse(BlogResponse blogResponse, String rawResponse ) {
         if (rawResponse == null || rawResponse.isBlank()) return;
         blogResponse.setContent(rawResponse);
         BlogStructurer.structure(blogResponse, rawResponse);
     }


     public BlogResponse updateBlogResponse(BlogResponse editedResponse) {
         String markdown = editedResponse.getExportFormats().getMarkdown();
         if (markdown == null || markdown.trim().isEmpty()) {
             return new BlogResponse(
                     "", // title
                     Collections.emptyList(), // sections
                     new BlogResponse.Metadata(0, new HashSet<>(), "0 min"), // metadata with empty set
                     new BlogResponse.ExportFormats("", "", "", false), // exportFormats
                     "", // content
                     0 // attempts
             );
         }

         BlogResponse updatedResponse = new BlogResponse();

         processResponse(updatedResponse, editedResponse.getExportFormats().getMarkdown());

         PDFGenerator.prepareForBlog(updatedResponse);

         return updatedResponse;
     }
}
