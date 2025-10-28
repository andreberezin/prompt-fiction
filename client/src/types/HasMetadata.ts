export interface HasMetaData {
    metadata: {
        wordCount: number;
        seoKeywords?: Array<string>;
        estimatedReadTime?: string;
    }
}