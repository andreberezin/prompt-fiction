package com.andrekj.ghostwriter.config;

import com.google.genai.Client;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class GeminiConfig {

    @Bean
    public Client geminiClient() {
        return new Client(); // reads GEMINI_API_KEY from environment
    }
}
