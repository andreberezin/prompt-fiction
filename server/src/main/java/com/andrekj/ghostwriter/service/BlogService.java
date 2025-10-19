package com.andrekj.ghostwriter.service;
import com.google.api.client.util.PemReader;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class BlogService extends BaseService {
    public BlogService(Client geminiClient, PDFGeneratorService pdfGeneratorService) {super(geminiClient);
        this.pdfGeneratorService = pdfGeneratorService;
    }

    private final PDFGeneratorService pdfGeneratorService;


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
        processResponse(blogResponse, response, request);

        // 5. Return BlogResponse object
//        blogResponse.setContent(response.text());

        preparePdfFormat(blogResponse);

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

         System.out.println("\n" + "\u001B[32m" + "prompt: \n" + prompt + "\u001B[0m \n");

         return prompt;
     }


     private void processResponse(BlogResponse blogResponse, GenerateContentResponse rawResponse, BlogRequest request) {
         if (rawResponse.text() == null || rawResponse.text().isBlank()) return;
         blogResponse.setContent(rawResponse.text());
//        cleanUpAiArtifacts(blogResponse);
        structureParsing(blogResponse, rawResponse, request);
     }

     private void structureParsing(BlogResponse blogResponse, GenerateContentResponse rawResponse, BlogRequest request) {
        String rawText = rawResponse.text();
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

            String plainline = setPlainText(line, plainTextBuilder); // get plain text format

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

         boolean wordCountCorrect = validateWordCount(request.getWordCount(), metadata.getWordCount());

         // set all final fields
         // todo validate structure (has title, 1 introduction, 2-4 H2, conclusion). If needed, restart
         blogResponse.setSections(sections);
         // todo validate that word count is within limits
         blogResponse.setMetadata(metadata);
         blogResponse.setExportFormats(exportFormats);

         System.out.println("\n" + "\u001B[32m" +  "Word count:" + "\u001B[0m" + metadata.getWordCount());
         System.out.println(wordCountCorrect ? "\u001B[32m" + "Word count correct" + "\u001B[0m" : "\u001B[31m" + "word count incorrect" + "\u001B[0m");
     }

     private String setPlainText(String line, StringBuilder plainTextBuilder) {

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
        String base64pdf = Base64.getEncoder().encodeToString(pdfBytes);
        blogResponse.getExportFormats().setPdfReady(true);
     }

     public BlogResponse updateBlogPost(BlogResponse editedResponse) {

        return editedResponse;
     }
}
