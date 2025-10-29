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

export default interface EmailResponseType {
    subject: string;
    body: string;
    metadata: Metadata;
    exportFormats: ExportFormats;
}

export const emptyEmailResponse: EmailResponseType = {
    subject: '',
    body: '',
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