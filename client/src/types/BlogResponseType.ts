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
    richTextContent: string;
}

export type ExportFormats = {
    markdown: string;
    plainText: string;
    richText: string;
    pdfReady: boolean;
}

export default interface BlogResponseType {
    title?: string;
    sections: Array<Section>;
    metadata: Metadata;
    exportFormats: ExportFormats;
    content: string;
    attempts: number;
    // wordCount?: number;
    // keywords?: string[];
}

export const emptyBLogResponse: BlogResponseType = {
    title: '',
    sections: [],
    metadata: {
        wordCount: 0,
        estimatedReadTime: '0 min',
        seoKeywords: [],
    },
    exportFormats: {
        markdown: '',
        plainText: '',
        richText: '',
        pdfReady: false,
    },
    content: '',
    attempts: 0
}