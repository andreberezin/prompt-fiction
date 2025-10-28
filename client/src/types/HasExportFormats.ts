export interface HasExportFormats {
    exportFormats: {
        markdown: string;
        plainText: string;
        richText?: string;
        pdfReady: boolean;
    };
}