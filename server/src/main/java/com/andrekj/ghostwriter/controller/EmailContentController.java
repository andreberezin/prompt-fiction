package com.andrekj.ghostwriter.controller;

import com.andrekj.ghostwriter.dto.EmailRequest;
import com.andrekj.ghostwriter.dto.EmailResponse;
import com.andrekj.ghostwriter.service.email.EmailService;
import com.andrekj.ghostwriter.service.util.PDFGenerator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api")
public class EmailContentController {

    private final EmailService emailService;

    public EmailContentController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/email/generate")
    public EmailResponse generateEmail(@RequestBody EmailRequest request) {
        return emailService.generateEmail(request, 1);
    }

    @MessageMapping("/email/update-auto")
    @SendTo("/topic/email-updated")
    public EmailResponse handleAutoUpdate(@RequestBody EmailResponse editedResponse) {
        return emailService.updateEmailResponse(editedResponse);
    }

    @PostMapping("/email/update-manual")
    public EmailResponse handleManualUpdate(@RequestBody EmailResponse editedResponse) {
        return emailService.updateEmailResponse(editedResponse);
    }


    @PostMapping("/email/pdf")
    public ResponseEntity<byte[]> generatePdf(@RequestBody EmailResponse editedResponse) {
        byte[] pdfBytes = PDFGenerator.generateEmailPDF(editedResponse);

        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd:hh:mm:ss");
        String currentDateTime = dateFormatter.format(new Date());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Ghostwriter_email_" + currentDateTime + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
