export default interface BlogFormData {
    aimodel: {
        model: string;
        tooltip: string;
    };
    contentType: string;
    topic: string;
    targetAudience: string;
    tone: string;
    expertiseLevel: string;
    wordCount: number;
    seoFocus: boolean;
}