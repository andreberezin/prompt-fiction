package com.andrekj.ghostwriter.service.util;

import com.andrekj.ghostwriter.dto.BlogResponse;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MetadataUtils {

    public static String calculateReadtime(int wordCount) {
        int wordsPerMinute = 200;
        int minutes = (int) Math.ceil(wordCount / (double) wordsPerMinute);
        return (minutes + " min");
    }

    public static void findSeoKeywords(String line, BlogResponse.Metadata metadata) {
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

}
