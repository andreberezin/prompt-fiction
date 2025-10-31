package com.andrekj.ghostwriter.service.blog;

import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;

import java.util.List;

public class BlogPromptGenerator {

    public static String generateBlogPrompt(BlogRequest request) {
        String sectionCount = "2-4";
        int minWordCount = (int) (request.getWordCount() * 0.90); // because the valid range is -10% to +10% and gemini keeps overshooting it
        int maxWordCount = (int) (request.getWordCount() * 1.10);

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
//        System.out.println("\n" + "\u001B[34m" + "Prompt: \n" + prompt + "\u001B[0m \n");
        return prompt;
    }

    public static String regenerateBlogPrompt(BlogRequest request, BlogResponse previousResponse, List<String> failedReasons) {
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

        String prompt = previousPromptPart +  validationErrorsPart + requirementsPart;

//        System.out.println("\n" + "\u001B[34m" + "New prompt: \n" + prompt + "\u001B[0m \n");

        return prompt;
    }
}
