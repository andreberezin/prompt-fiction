export type Metadata = {
    wordCount: number;
    estimatedReadTime: string;
}
export type ExportFormats = {
    markdown: string;
    plainText: string;
    richText: string;
    pdfReady: boolean;
}

export type Section = {
    type: string;
    title: string;
    markdownContent: string;
    plainTextContent: string;
    richTextContent: string;
}

export default interface EmailResponseType {
    subject: string;
    body: string;
    sections: Array<Section>;
    content: string;
    metadata: Metadata;
    exportFormats: ExportFormats;
}

export const emptyEmailResponse: EmailResponseType = {
    subject: '',
    body: '',
    sections: [],
    content: '',
    metadata: {
        wordCount: 0,
        estimatedReadTime: '0 min',
    },
    exportFormats: {
        markdown: '',
        plainText: '',
        richText: '',
        pdfReady: false,
    },
}