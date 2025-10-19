package com.andrekj.ghostwriter.controller;

import com.andrekj.ghostwriter.dto.BlogRequest;
import com.andrekj.ghostwriter.dto.BlogResponse;
import com.andrekj.ghostwriter.exceptions.AIServiceException;
import com.andrekj.ghostwriter.service.BlogService;
import com.andrekj.ghostwriter.service.PDFGeneratorService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api")
public class ContentController {

    private final BlogService blogService;
    private final PDFGeneratorService pdfGeneratorService;

    public ContentController(BlogService blogservice, PDFGeneratorService pdfGeneratorService) {
        this.blogService = blogservice;
        this.pdfGeneratorService = pdfGeneratorService;
    }

    @PostMapping("/blog/generate")
    public BlogResponse generateBlogPost(@RequestBody BlogRequest request) {
//        if (true) { // testing error handling
//            throw new AIServiceException("Simulated AI API error");
//        }
        return blogService.generateBlogPost(request);
    }

    @PostMapping("/blog/update")
    public BlogResponse generateBlogPost(@RequestBody BlogResponse editedResponse) {

        return blogService.updateBlogPost(editedResponse);
    }

    @PostMapping("/blog/pdf")
    public ResponseEntity<byte[]> generatePdf(@RequestBody BlogResponse editedResponse) {
        pdfGeneratorService.updateSections(editedResponse);

        byte[] pdfBytes = pdfGeneratorService.generateBlogPDF(editedResponse);

        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd:hh:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Ghostwriter_blogPost_" + currentDateTime + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
