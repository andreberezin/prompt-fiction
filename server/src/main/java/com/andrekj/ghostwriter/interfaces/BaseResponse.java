package com.andrekj.ghostwriter.interfaces;

import java.util.List;

public interface BaseResponse {
    String getContent();
    int getWordCount();
    String getTitle();
    List<String> getKeywords();
}
