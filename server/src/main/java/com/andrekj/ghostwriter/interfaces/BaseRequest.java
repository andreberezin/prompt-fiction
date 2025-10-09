package com.andrekj.ghostwriter.interfaces;

public interface BaseRequest {
    String getContentType();
    int getWordCount();
    String getAimodel();
}
