package com.andrekj.ghostwriter.service;

import com.andrekj.ghostwriter.dto.BlogResponse;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PDFGeneratorService {

    // todo let the user choose font, alignment and so on
public byte[] generateBlogPDF(BlogResponse blogResponse) {
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

//            int numOfSections = blogResponse.getSections().size();

        for (BlogResponse.Section section : blogResponse.getSections()) {

            document.add(new Paragraph(section.getTitle(), h2Font));
            document.add(new Paragraph(section.getPlainTextContent(), textFont));
            document.add(Chunk.NEWLINE);
        }

        document.close();
        //System.out.println("\n" + "\u001B[32m" +  "PDF Generated" + "\u001B[0m");
        return out.toByteArray();
    } catch (Exception e) {
        throw new RuntimeException("Error generating PDF: " + e.getMessage());
    }
}
}
