package com.andrekj.ghostwriter.service;
import com.andrekj.ghostwriter.exceptions.ContentGenerationException;
import com.google.api.client.util.PemReader;
import com.google.genai.Client;
import com.google.genai.types.*;
import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class BlogService extends BaseService {
//    private GenerateContentResponse response;
//    private BlogRequest blogRequest;
//    private BlogResponse blogResponse;
//    private String modifications;
//    private GenerateContentConfig config;

    private final PDFGeneratorService pdfGeneratorService;
    private final SimpMessagingTemplate messagingTemplate;


    public BlogService (Client geminiClient, PDFGeneratorService pdfGeneratorService, SimpMessagingTemplate messagingTemplate) {super(geminiClient);
        this.pdfGeneratorService = pdfGeneratorService;
        this.messagingTemplate = messagingTemplate;
    }

    public BlogResponse generateBlog(BlogRequest request, int attempt) {
        //this.blogRequest = request;

        //messagingTemplate.convertAndSend("/topic/blog-retry", "Starting generation...");
        if (attempt == 1) messagingTemplate.convertAndSend("/topic/blog-status", "Generating blog..");

        //try {

        // gemini-2.5-pro has max 2 requests per minute on free tier
            if (request.getAimodel().equalsIgnoreCase("gemini-2.5-pro")) MAX_RETRIES = 2;

            // 1. Normalize input (word count range, tone, etc.)
            normalizeBlogRequest(request);

            // 1.5 prepare for prompt building and validation
            String prompt = null;
            BlogResponse blogResponse = null;
            List<String> validationErrors = new ArrayList<>();
            int currentAttempt = attempt;

            // 2. build the prompt
            for (; currentAttempt <= MAX_RETRIES; currentAttempt++) {
                messagingTemplate.convertAndSend("/topic/blog-retry", "Starting generation...");
                if (currentAttempt == 1) { // 2.1 regular prompt
                    prompt = generateBlogPrompt(request);
                } else { // 2.2 Regenerate prompt based on last response and errors
                    prompt = regenerateBlogPrompt(request, blogResponse, validationErrors);
                    System.out.println("Retrying blog generation (attempt " + currentAttempt + ")\n");
                    messagingTemplate.convertAndSend("/topic/blog-status", "Generated content was not up to code. Retrying...");
                }

                // 3. Build config and call the AI api
                GenerateContentConfig config = buildConfig(request);
                GenerateContentResponse response = callAiAPI(request, prompt, config);

                // 4. Process the response
                blogResponse = new BlogResponse();
                processResponse(blogResponse, response.text());
                blogResponse.setAttempts(currentAttempt);

                // 5. Validate response
                validationErrors = validateResponse(blogResponse, request);
                if (validationErrors.isEmpty()) {
                    // Valid response, break and continue to cleanup
                    break;
                }
            }

            if (!validationErrors.isEmpty()) {
                handleTooManyRetriesError("blog", MAX_RETRIES, messagingTemplate);
            }

            // 6. clean up response
            cleanupResponse(blogResponse);

            // 7. Prepare pdf format
            preparePdfFormat(blogResponse);

            // return response object
            return blogResponse;
//        } catch (Exception e) {
//            System.err.println("Error during blog generation: " + e.getMessage());
//            throw new RuntimeException("Failed to generate blog post", e);
//        }
    }

    private void normalizeBlogRequest(BlogRequest request) {
        request.setTopic(request.getTopic().trim().toLowerCase());
        request.setTargetAudience(request.getTargetAudience().trim().toLowerCase());
        request.setTone(request.getTone().trim().toLowerCase());
        request.setExpertiseLevel(request.getExpertiseLevel().trim().toLowerCase());
        request.setWordCount(Math.max(100, Math.min(request.getWordCount(), 2000)));
    }


     private String generateBlogPrompt(BlogRequest request) {
//        String sectionCount = String.valueOf((int)Math.min(Math.floor((float) request.getWordCount() / 100), 6));
         String sectionCount = "2-4";
         int minWordCount = (int) (request.getWordCount() * 0.90); // because the valid range is -10% to +10% and gemini keeps overshooting it
         int maxWordCount = (int) (request.getWordCount() * 1.10);

         //StringBuilder prompt2 = new StringBuilder();

//         prompt2.append("You are an expert content writer specializing in ").append(request.getContentType()).append("s.\n")
//                 .append("Write a ").append(request.getTone()).append(" ").append(", ").append(request.getExpertiseLevel()).append("-level").append();

//         String prompt = "You are an expert content writer specializing in " + request.getContentType() + "s.\n" +
//                 "Write a " + request.getTone() + ", " + request.getExpertiseLevel() + "-level " + request.getContentType() + " about '" + request.getTopic() + "' for " +
//                 request.getTargetAudience() + ".  Target length is between " + minWordCount + " and " + maxWordCount + " words, do not exceed this limit" + ".\n" +
////                 "Requirements:\n" +
////                 "- Target length: " + request.getWordCount() + " words\n" +
////                 "- Tone: " + request.getTone() + "\n" +
//                 "- Structure: #Title, ##Introduction, " + sectionCount + " main sections (titled ##), a short ##Conclusion\n" +
//                 (request.isSeoFocus() ? "- Include 5 SEO keywords and wrap them in _italics_ markdown \n" : "") +
//                  "Format your response in Markdown.";

         String basePrompt = String.format("""
                 You are an expert blog post writer.
                 Write a %s %s-level blog post about %s for %s.
                 """,
                 request.getTone(),
                 request.getExpertiseLevel(),
                 request.getTopic(),
                 request.getTargetAudience());

         String structurePart = String.format("""
                 Target length: between %d and %d words. Do not exceed this limit.
                 Format the blog post in markdown without commentary and with these sections:
                  - #Title
                  - ##Introduction
                  - %s ## body sections
                  - a short ##Conclusion
                 """,
                 minWordCount,
                 maxWordCount,
                 sectionCount
                 );

         String seoPart = request.isSeoFocus()
                 ? ("- Include 5 SEO keywords and wrap them in _italics_ markdown.")
                 : "";

         String prompt = basePrompt + structurePart + seoPart;
         System.out.println("\n" + "\u001B[34m" + "Prompt: \n" + prompt + "\u001B[0m \n");
         return prompt;
     }

    private String regenerateBlogPrompt(BlogRequest request, BlogResponse previousResponse, List<String> failedReasons) {
        String sectionCount = "2-4";
        String reasons = failedReasons.isEmpty() ? "The previous response was invalid" : String.join(", ", failedReasons);

        int minWordCount = (int) (request.getWordCount() * 0.90); // because the valid range is -10% to +10% and gemini keeps overshooting it
        int maxWordCount = (int) (request.getWordCount() * 1.10);

        int prevWordCount = previousResponse.getMetadata().getWordCount();
        String adjustAction = prevWordCount > maxWordCount ? "remove" : "add";
        int wordsToAdjust = Math.abs(prevWordCount - request.getWordCount());

        String previousPromptPart = previousResponse.getContent();

        String validationErrorsPart = String.format("""
                It did not meed the validation requirements because: %s
                """,
                reasons);

        // - Preserve valuable existing text when possible
        String requirementsPart = String.format("""
                Regenerate the blog so that:
                - It follows the structure:
                    - #Title
                    - ##Introduction
                    - %s ## main sections
                    - a short ##Conclusion
                - the total word count must be between %d and %d
                The previous version had %d words, so %s approximately %d word
                - The tone, expertise level and target audience remain the same
                - Return  markdown only, no explanations.
                """,
                sectionCount,
                minWordCount,
                maxWordCount,
                prevWordCount,
                adjustAction,
                wordsToAdjust
                );

//        String prompt = """
//                Here is the blog content previously generated:
//                %s
//                It did not meet the validation requirements because: %s
//
//                Regenerate the blog so that:
//                - it follows the structure: #Title, ##Introduction, %s main sections (titled ##), a short ##Conclusion
//                - The total word count must be between %d and %d
//                  The previous version had %d words, so %s approximately %d words to fall within the target range.
//                - The tone, expertise level and target audience remain the same
//                - Preserve valuable existing text when possible
//                - Return Markdown only, no explanations
//                """.formatted(
//                        previousResponse.getContent(),
//                        reasons,
//                        sectionCount,
//                        minWordCount,
//                        maxWordCount,
//                        prevWordCount,
//                        adjustAction,
//                        wordsToAdjust
//                );

        String prompt = previousPromptPart +  validationErrorsPart + requirementsPart;

        System.out.println("\n" + "\u001B[34m" + "New prompt: \n" + prompt + "\u001B[0m \n");

        return prompt;
    }

     private void processResponse(BlogResponse blogResponse, String rawResponse ) {
         if (rawResponse == null || rawResponse.isBlank()) return;
         blogResponse.setContent(rawResponse);
//        cleanUpAiArtifacts(blogResponse);
        structureParsing(blogResponse, rawResponse);
     }

     private void structureParsing(BlogResponse blogResponse, String rawText) {
        //String rawText = rawResponse.text();
        assert rawText != null;
        String[] lines = rawText.split("\n");

        String currentSectionTitle = null;
        String currentSectionType = "introduction";
        StringBuilder currentSectionMarkdownContent = new StringBuilder();
        StringBuilder currentSectionPlainTextContent = new StringBuilder();
        List<BlogResponse.Section> sections = new ArrayList<>();

        // prepare exportFormats and Metadata
         BlogResponse.Metadata metadata = new BlogResponse.Metadata(0, new HashSet<>(), "");
         StringBuilder plainTextBuilder = new StringBuilder();

        for (String line : lines) {
            line = line.trim();
            if (line.isBlank()) continue;

            String plainLine = convertLineToPLainText(line); // get plain text format

            metadata.setWordCount(metadata.getWordCount() + countWords(plainLine)); // get wordcount

            findSeoKeywords(line, metadata); // find seo keywords

            String cleanLine = line.replaceAll("^\\*\\*", "").replaceAll("\\*\\*$", "").trim();
            // parse for structure
            if (cleanLine.startsWith("# ")) { // title
                blogResponse.setTitle(line.substring(1).trim());

                plainTextBuilder.append("\n").append(plainLine).append("\n\n");
//                if (!plainTextBuilder.isEmpty()) {
//                    plainTextBuilder.append("\n").append(plainLine).append("\n\\n");
//                }
            } else if (cleanLine.startsWith("## ")) { // section

                plainTextBuilder.append("\n").append(plainLine).append("\n");

                // previous section
                if (currentSectionType != null && !currentSectionMarkdownContent.isEmpty()) {
                    BlogResponse.Section section = new BlogResponse.Section();
                    section.setType(currentSectionType);
                    section.setTitle(currentSectionTitle);
                    section.setMarkdownContent(currentSectionMarkdownContent.toString().trim());
                    section.setPlainTextContent(currentSectionPlainTextContent.toString().trim());
                    sections.add(section);
                }

                // Start new section
                currentSectionTitle = cleanLine.substring(2).trim();

                // Map header title to section type
                if (currentSectionTitle != null) {
                    String lower = currentSectionTitle.toLowerCase();
                    if (lower.contains("introduction") || lower.contains("intro")) {
                        currentSectionType = "introduction";
                    } else if (lower.contains("conclusion") ||
                            lower.contains("summary") ||
                            lower.contains("wrap up") ||
                            lower.contains("final thoughts")) {
                        currentSectionType = "conclusion";
                    } else {
                        currentSectionType = "body";
                    }
                }

                // reset section content
                currentSectionMarkdownContent = new StringBuilder();
                currentSectionPlainTextContent = new StringBuilder();
            } else {
                plainTextBuilder.append(plainLine).append("\n");

                currentSectionMarkdownContent.append(line).append("\n");
                currentSectionPlainTextContent.append(plainLine).append("\n");
            }
        }

         // Add the last section
         if (currentSectionType != null) {
             BlogResponse.Section section = new BlogResponse.Section();
             section.setType(currentSectionType);
             section.setTitle(currentSectionTitle);
             section.setMarkdownContent(currentSectionMarkdownContent.toString().trim());
             section.setPlainTextContent(currentSectionPlainTextContent.toString().trim());
             sections.add(section);
         }

         BlogResponse.ExportFormats exportFormats = new BlogResponse.ExportFormats(
                 rawText, // markdown
                 plainTextBuilder.toString().trim(), // plain text
                 "", // rich text tbd
                 false // pdf ready
         );

         // estimated read time
         metadata.setEstimatedReadTime(calculateReadtime(metadata.getWordCount()));

         // set all final fields
         blogResponse.setSections(sections);
         blogResponse.setMetadata(metadata);
         blogResponse.setExportFormats(exportFormats);
     }

     private void findSeoKeywords(String line, BlogResponse.Metadata metadata) {
         String[] patterns = {
//                 "\\*\\*(.*?)\\*\\*",   // bold **keyword**
//                 "\"([^\"]+)\"",        // quoted "keyword"
                 "_([^_]+)_"            // italic _keyword_
         };

         for (String pattern : patterns) {
             Matcher matcher = Pattern.compile(pattern).matcher(line);
             while (matcher.find()) {
                 String keyword = matcher.group(1).trim();
                 keyword = keyword.replaceAll("[^\\w\\s-]", ""); // remove punctuation
                 if (!keyword.isEmpty()) {
                     metadata.getSeoKeywords().add(keyword);
                 }
             }
         }
     }

     private void preparePdfFormat(BlogResponse blogResponse) {
        byte[] pdfBytes = pdfGeneratorService.generateBlogPDF(blogResponse);
        blogResponse.getExportFormats().setPdfReady(true);
     }

     private List<String> validateResponse(BlogResponse blogResponse, BlogRequest blogRequest) {
         List<String> errors = new ArrayList<>();

        if (blogResponse == null || blogResponse.getContent() == null) return errors;

        List<BlogResponse.Section> sections = blogResponse.getSections();
        if (sections == null || sections.isEmpty()) {
            System.out.println("\u001B[31m" + "Validation failed: no sections found" + "\u001B[0m");
            return errors;
        }

        // validate word count
         boolean validWordCount = validateWordCount(blogRequest.getWordCount(), blogResponse.getMetadata().getWordCount());

         // validate title
         boolean hasTitle = blogResponse.getTitle() != null && !blogResponse.getTitle().trim().isEmpty();

         // validate structure
         boolean firstIsIntro = sections.getFirst().getType().equalsIgnoreCase("introduction");
         boolean lastIsConclusion = sections.getLast().getType().equalsIgnoreCase("conclusion");

         // count sections
         long introCount = sections.stream().filter(s -> "introduction".equalsIgnoreCase(s.getType())).count();
         long bodyCount = sections.stream().filter(s -> "body".equalsIgnoreCase(s.getType())).count();
         long conclusionCount = sections.stream().filter(s -> "conclusion".equalsIgnoreCase(s.getType())).count();

         // validate content
         boolean allHaveText = sections.stream().allMatch(s -> s.getMarkdownContent() != null && !s.getMarkdownContent().isEmpty() &&
                 s.getPlainTextContent() != null && !s.getPlainTextContent().isEmpty());

         boolean allBodyHaveTitle = sections.stream()
                 .filter(s -> "body".equalsIgnoreCase(s.getType()))
                 .allMatch(s -> s.getTitle() != null && !s.getTitle().isBlank());

         boolean structureValid =
                 firstIsIntro &&
                 lastIsConclusion &&
                 introCount == 1 &&
                 conclusionCount == 1 &&
                 bodyCount >= 2 &&
                 bodyCount <= 4 &&
                 allHaveText &&
                 allBodyHaveTitle;

         boolean overallValid = validWordCount && hasTitle && structureValid;

         if (!overallValid) {
             System.out.println("\n" + "\u001B[31m" +  "Validation failed:"  + "\u001B[0m");

             if (!validWordCount) {
                 System.out.println(" - Invalid word count: " + blogResponse.getMetadata().getWordCount());
                 errors.add("Invalid word count");
             };

             if (!hasTitle) {
                 System.out.println(" - Missing main title");
                 errors.add("Missing title");
             };

             if (!firstIsIntro) {
                 System.out.println(" - First section is not introduction");
                 errors.add("First section is not ##Introduction");
             };
             if (!lastIsConclusion) {
                 System.out.println(" - Last section is not conclusion");
                 errors.add("Last section is not ##Conclusion");
             };
             if (introCount != 1) {
                 System.out.println(" - Invalid number of introductions (" + introCount + ")");
                 errors.add("Invalid number of ##Introductions, need one");
             };
             if (conclusionCount != 1) {
                 System.out.println(" - Invalid number of conclusions (" + conclusionCount + ")");
                 errors.add("Invalid number of ##Conclusions, need one");
             };
             if (bodyCount < 1) {
                 System.out.println(" - No body sections found");
                 errors.add("No body sections found");
             };
//             if (bodyCount <= 1) System.out.println(" - No body sections found");
//             if (bodyCount >= 5) System.out.println(" - No body sections found");
             if (!allHaveText) {
                 System.out.println(" - Some sections have no content");
                 errors.add("Some sections have no content");
             };
             if (!allBodyHaveTitle) {
                 System.out.println(" - Some body sections have no titles");
                 errors.add("Some body sections have no titles");
             };
         } else {
             System.out.println("\n" + "\u001B[32m" +  "Response is valid" + "\u001B[0m");
         }

         return errors;
     }


     private void cleanupResponse(BlogResponse blogResponse) {
         List<BlogResponse.Section> sections = blogResponse.getSections();
         for (BlogResponse.Section section : sections) {
             section.setPlainTextContent(cleanupText(section.getPlainTextContent()));
             section.setMarkdownContent(cleanupText(section.getMarkdownContent()));
             section.setRichTextContent(cleanupText(section.getRichTextContent()));
         }
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

        //cleanupResponse(updatedResponse);

        preparePdfFormat(updatedResponse);

        return updatedResponse;
     }
}
