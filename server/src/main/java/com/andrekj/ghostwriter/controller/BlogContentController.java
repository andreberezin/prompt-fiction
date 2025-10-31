package com.andrekj.ghostwriter.controller;

import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;
import com.andrekj.ghostwriter.service.blog.BlogService;
import com.andrekj.ghostwriter.service.util.PDFGenerator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api")
public class BlogContentController {

    private final BlogService blogService;

    public BlogContentController(BlogService blogservice) {
        this.blogService = blogservice;
    }

    @PostMapping("/blog/generate")
    public BlogResponse generateBlogPost(@RequestBody BlogRequest request) {
        return blogService.generateBlog(request, 1);
    }

    @MessageMapping("/blog/update-auto")
    @SendTo("/topic/blog-updated")
    public BlogResponse handleAutoUpdate(@RequestBody BlogResponse editedResponse) {
        return blogService.updateBlogResponse(editedResponse);
    }

    @PostMapping("/blog/update-manual")
    public BlogResponse handleManualUpdate(@RequestBody BlogResponse editedResponse) {
        return blogService.updateBlogResponse(editedResponse);
    }


    @PostMapping("/blog/pdf")
    public ResponseEntity<byte[]> generatePdf(@RequestBody BlogResponse editedResponse) {
        byte[] pdfBytes = PDFGenerator.generateBlogPDF(editedResponse);

        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd:hh:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Ghostwriter_blogPost_" + currentDateTime + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
