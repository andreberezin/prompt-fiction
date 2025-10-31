import type BaseRequestType from "./BaseRequestType.ts";

export default interface BlogRequestType extends BaseRequestType {
    topic: string;
    targetAudience: string;
    tone: string;
    expertiseLevel: string;
    seoFocus: boolean;
}

export const emptyBlogRequest: BlogRequestType = {
    aimodel: {
        model: 'gemini-2.5-flash-lite',
        tooltip: 'ultra fast'
    },
    contentType: 'blog',
    wordCount: 300,
    topic: '',
    targetAudience: '',
    tone: '',
    expertiseLevel: '',
    seoFocus: false,
}