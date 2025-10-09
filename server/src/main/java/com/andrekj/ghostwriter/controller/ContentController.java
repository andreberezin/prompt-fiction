package com.andrekj.ghostwriter.controller;

import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;
import com.andrekj.ghostwriter.service.BlogService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ContentController {

    private final BlogService blogService;

    public ContentController(BlogService blogservice) {
        this.blogService = blogservice;
    }

    @PostMapping("/blog")
    public BlogResponse generateBlogPost(@RequestBody BlogRequest request) {
        return blogService.generateBlogPost(request);
    }
}
