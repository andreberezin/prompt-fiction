package com.andrekj.ghostwriter.service.util;

import com.andrekj.ghostwriter.dto.BlogResponse;
import com.andrekj.ghostwriter.dto.EmailResponse;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;

public class PDFGenerator {

    public static void prepareForBlog(BlogResponse blogResponse) {
        byte[] pdfBytes = PDFGenerator.generateBlogPDF(blogResponse);
        blogResponse.getExportFormats().setPdfReady(true);
    }

    // todo let the user choose font, alignment and so on
    public static byte[] generateBlogPDF(BlogResponse blogResponse) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // fonts
            Font h1Font = new Font(Font.FontFamily.TIMES_ROMAN, 16, Font.BOLD);
            Font h2Font = new Font(Font.FontFamily.TIMES_ROMAN, 14, Font.BOLD);
            Font textFont = new Font(Font.FontFamily.TIMES_ROMAN, 12);

            Paragraph title = new Paragraph(blogResponse.getTitle(), h1Font);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);

            document.add(Chunk.NEWLINE);

            for (BlogResponse.Section section : blogResponse.getSections()) {

                document.add(new Paragraph(section.getTitle(), h2Font));
                document.add(new Paragraph(section.getPlainTextContent(), textFont));
                document.add(Chunk.NEWLINE);
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage());
        }
}

    public static void prepareForEmail(EmailResponse emailResponse) {
        byte[] pdfBytes = PDFGenerator.generateEmailPDF(emailResponse);
        emailResponse.getExportFormats().setPdfReady(true);
    }

    public static byte[] generateEmailPDF(EmailResponse emailResponse) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // fonts
            Font textFont = new Font(Font.FontFamily.TIMES_ROMAN, 12);

            document.add(new Paragraph(emailResponse.getSubject(), textFont));

            for (EmailResponse.Section section : emailResponse.getSections()) {
                document.add(new Paragraph(section.getPlainTextContent(), textFont));
                document.add(Chunk.NEWLINE);
            }

            document.close();

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage());
        }
    }
}
