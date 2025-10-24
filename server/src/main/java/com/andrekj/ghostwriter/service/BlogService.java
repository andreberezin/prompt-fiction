package com.andrekj.ghostwriter.service;
import com.andrekj.ghostwriter.exceptions.ContentGenerationException;
import com.google.api.client.util.PemReader;
import com.google.genai.Client;
import com.google.genai.types.*;
import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class BlogService extends BaseService {

    public BlogService(Client geminiClient, PDFGeneratorService pdfGeneratorService) {super(geminiClient);
        this.pdfGeneratorService = pdfGeneratorService;
    }

    private final PDFGeneratorService pdfGeneratorService;


    public BlogResponse generateBlogPost(BlogRequest request, int attempt) {
        try {
            // set max retries based on selected ai model
            if (request.getAimodel().equalsIgnoreCase("gemini-2.5-pro")) {
                MAX_RETRIES = 2;
            }

            // 1. Normalize input (word count range, tone, etc.)
            normalizeBlogInput(request);

            // 2. Build a prompt string based on request data
            String prompt = createBlogPrompt(request);

            // 3. Call AI API
            GenerateContentConfig config = buildConfig(request);
            GenerateContentResponse response = callAiAPI(request, prompt, config);

            // 4. Process AI response (parse JSON or text)
            BlogResponse blogResponse = new BlogResponse();
            processResponse(blogResponse, response.text());

            // 5. Validate response
            if (!validateResponse(blogResponse, request)) {
                if (attempt <= MAX_RETRIES) {
                    // todo regenerate only the invalid parts
                    attempt++;
                    System.out.println("Retrying blog generation (attempt " + (attempt) + ")");
                    blogResponse.setAttempts(attempt);
                    return generateBlogPost(request, attempt);
                } else {
                    System.out.println("Too many retries");
                    throw new ContentGenerationException("Blog generation failed after " + MAX_RETRIES + " attempts.");
                }
            }

            // 6. clean up response
            cleanupResponse(blogResponse);

            // 7. prepare pdf format
            preparePdfFormat(blogResponse);

            // return response object
            return blogResponse;
        } catch (Exception e) {
            System.err.println("Error during blog generation: " + e.getMessage());
            throw new RuntimeException("Failed to generate blog post", e);
        }
    }

    private void normalizeBlogInput(BlogRequest request) {
        request.setTopic(request.getTopic().trim().toLowerCase());
        request.setTargetAudience(request.getTargetAudience().trim().toLowerCase());
        request.setTone(request.getTone().trim().toLowerCase());
        request.setExpertiseLevel(request.getExpertiseLevel().trim().toLowerCase());
        request.setWordCount(Math.max(10, Math.min(request.getWordCount(), 2000)));
    }


     private String createBlogPrompt(BlogRequest request) {
//        String sectionCount = String.valueOf((int)Math.min(Math.floor((float) request.getWordCount() / 100), 6));
         String sectionCount = "2-4";
         int wordCount = (int) (request.getWordCount() * 0.90); // because the valid range is -10% to +10% and gemini keeps overshooting it

        // todo edit prompt - doesn't always include a conclusion
         String prompt = "You are an expert content writer specializing in " + request.getContentType() + "s.\n" +
                 "Write a " + request.getTone() + ", " + request.getExpertiseLevel() + "-level " + request.getContentType() + " about '" + request.getTopic() + "' for " +
                 request.getTargetAudience() + ".  Target length is " + wordCount + " words, do not exceed this limit" + ".\n" +
//                 "Requirements:\n" +
//                 "- Target length: " + request.getWordCount() + " words\n" +
//                 "- Tone: " + request.getTone() + "\n" +
                 "- Structure: Title, Introduction (titled ##Introduction), " + sectionCount + " main sections (titled ##), a short conclusion (titled ##Conclusion)\n" +
                 (request.isSeoFocus() ? "- Include 5 SEO keywords and wrap them in **bold** markdown \n" : "") +
                  "Format your response in Markdown.";

         System.out.println("\n" + "\u001B[34m" + "Prompt: \n" + prompt + "\u001B[0m \n");

         return prompt;
     }


     private void processResponse(BlogResponse blogResponse, String markdownResponse ) {
         if (markdownResponse == null || markdownResponse.isBlank()) return;
         blogResponse.setContent(markdownResponse);
//        cleanUpAiArtifacts(blogResponse);
        structureParsing(blogResponse, markdownResponse);
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
            if (line.isEmpty()) continue;

            String plainline = setPlainText(line); // get plain text format

            metadata.setWordCount(metadata.getWordCount() + countWords(plainline)); // get wordcount

            findSeoKeywords(line, metadata); // find seo keywords

            // parse for structure
            if (line.startsWith("# ")) { // title
                blogResponse.setTitle(line.substring(1).trim());

                plainTextBuilder.append("\n").append(plainline).append("\n\n");
//                if (!plainTextBuilder.isEmpty()) {
//                    plainTextBuilder.append("\n").append(plainline).append("\n\\n");
//                }
            } else if (line.startsWith("## ")) { // section

                plainTextBuilder.append("\n").append(plainline).append("\n");

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
                currentSectionTitle = line.substring(2).trim();

                // Map header title to section type
                if (currentSectionTitle.equalsIgnoreCase("Introduction")) {
                    currentSectionType = "introduction";
                } else if (currentSectionTitle.equalsIgnoreCase("Conclusion")) {
                    currentSectionType = "conclusion";
                } else {
                    currentSectionType = "body";
                }

                // reset section content
                currentSectionMarkdownContent = new StringBuilder();
                currentSectionPlainTextContent = new StringBuilder();
            } else {
                plainTextBuilder.append(plainline).append("\n");

                currentSectionMarkdownContent.append(line).append("\n");
                currentSectionPlainTextContent.append(plainline).append("\n");
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
                 false // pdf ready
         );

         // estimated read time
         int wordsPerMinute = 200;
         int minutes = (int) Math.ceil(metadata.getWordCount() / (double) wordsPerMinute);
         metadata.setEstimatedReadTime(minutes + " min");

         // set all final fields
         blogResponse.setSections(sections);
         blogResponse.setMetadata(metadata);
         blogResponse.setExportFormats(exportFormats);
     }

     private String setPlainText(String line) {

         String plainLine = line
                 .replaceAll("#+", "") // headers
                 .replaceAll("\\*", "") // remove seo markers (bold) ("\\*\\*(.*?)\\*\\*", "$1")
                 .replaceAll("_([^_]+)_", "$1") // italics
                 .trim();

//         plainTextBuilder.append(plainLine);

         return plainLine;
     }

     private void findSeoKeywords(String line, BlogResponse.Metadata metadata) {
         String[] patterns = {
                 "\\*\\*(.*?)\\*\\*",   // bold **keyword**
//                 "\"([^\"]+)\"",        // quoted "keyword"
//                 "_([^_]+)_"            // italic _keyword_
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

     private boolean validateResponse(BlogResponse blogResponse, BlogRequest blogRequest) {
        if (blogResponse == null || blogResponse.getContent() == null) return false;

        List<BlogResponse.Section> sections = blogResponse.getSections();
        if (sections == null || sections.isEmpty()) {
            System.out.println("\u001B[31m" + "Validation failed: no sections found" + "\u001B[0m");
            return false;
        }

        // validate word count
         boolean validWordCount = validateWordCount(blogRequest.getWordCount(), blogResponse.getMetadata().getWordCount());

         // validate title
         boolean hasTitle = blogResponse.getTitle() != null && !blogResponse.getTitle().isEmpty();

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
             if (!validWordCount) System.out.println(" - Invalid word count");
             if (!hasTitle) System.out.println(" - Missing main title");
             if (!firstIsIntro) System.out.println(" - First section is not introduction");
             if (!lastIsConclusion) System.out.println(" - Last section is not conclusion");
             if (introCount != 1) System.out.println(" - Invalid number of introductions (" + introCount + ")");
             if (conclusionCount != 1) System.out.println(" - Invalid number of conclusions (" + conclusionCount + ")");
             if (bodyCount < 1) System.out.println(" - No body sections found");
//             if (bodyCount <= 1) System.out.println(" - No body sections found");
//             if (bodyCount >= 5) System.out.println(" - No body sections found");
             if (!allHaveText) System.out.println(" - Some sections have no content");
             if (!allBodyHaveTitle) System.out.println(" - Some body sections have no titles");
         }

         System.out.println("\n" + "\u001B[32m" +  "Response is valid" + "\u001B[0m");
         return overallValid;
     }

     private void cleanupResponse(BlogResponse blogResponse) {
         List<BlogResponse.Section> sections = blogResponse.getSections();
         for (BlogResponse.Section section : sections) {
             section.setPlainTextContent(cleanupText(section.getPlainTextContent()));
             section.setMarkdownContent(cleanupText(section.getMarkdownContent()));
         }
     }

    private String cleanupText(String text) {
        if (text == null) return "";
        text = text.trim()
                .replaceAll("\\r\\n|\\r", "\n")
                .replaceAll("(?i)As an AI.*?\\.", "");
        return Arrays.stream(text.split("\n"))
                .map(String::stripTrailing)
                .collect(Collectors.joining("\n"));
    }

     public BlogResponse updateBlogPost(BlogResponse editedResponse) {
        BlogResponse updatedResponse = new BlogResponse();

        processResponse(updatedResponse, editedResponse.getExportFormats().getMarkdown());

        //cleanupResponse(updatedResponse);

        preparePdfFormat(updatedResponse);

        return updatedResponse;
     }
}
