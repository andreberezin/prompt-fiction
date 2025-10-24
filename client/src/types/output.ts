export type Metadata = {
    wordCount: number;
    seoKeywords: Array<string>;
    estimatedReadTime: string;
}

export type Section = {
    type: string;
    title: string;
    markdownContent: string;
    plainTextContent: string;
}

export type ExportFormats = {
    markdown: string;
    plainText: string;
    pdfReady: boolean;
}

export default interface OutputType {
    title?: string;
    sections: Array<Section>;
    metadata: Metadata;
    exportFormats: ExportFormats;
    content: string;
    attempts: number;
    // wordCount?: number;
    // keywords?: string[];
}