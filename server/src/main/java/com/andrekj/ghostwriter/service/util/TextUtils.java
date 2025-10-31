package com.andrekj.ghostwriter.service.util;

import java.util.Arrays;
import java.util.stream.Collectors;

public class TextUtils {

    public static int countWords(String line) {
        return line.split(" ").length;
    }

    public static boolean validateWordCount(int desiredWordCount, int actualWordCount) {
        int lowerLimit = (int) Math.ceil(desiredWordCount * 0.9);
        int upperLimit = (int) Math.floor(desiredWordCount * 1.1);
        return actualWordCount >= lowerLimit && actualWordCount <= upperLimit;
    }

    public static String convertLineToPLainText(String line) {
        return line
                .replaceAll("#+", "") // headers
                .replaceAll("\\*", "") // remove seo markers (bold) ("\\*\\*(.*?)\\*\\*", "$1")
                .replaceAll("_([^_]+)_", "$1") // italics
                .trim();
    }

    public static String cleanupText(String text) {
        if (text == null) return "";
        text = text.trim()
                .replaceAll("\\r\\n|\\r", "\n")
                .replaceAll("(?i)As an AI.*?\\.", "");
        return Arrays.stream(text.split("\n"))
                .map(String::stripTrailing)
                .collect(Collectors.joining("\n"));
    }

}
