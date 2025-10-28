import type BaseRequestType from "./BaseRequestType.ts";

export default interface EmailRequestType extends BaseRequestType {
    purpose: string;
    recipientContext: string;
    keyPoints: string;
    tone: string;
    urgencyLevel: string;
    cta: string;
}

export const emptyEmailRequest: EmailRequestType = {
    aimodel: {
        model: 'gemini-2.5-flash-lite',
        tooltip: 'ultra fast'
    },
    contentType: 'email',
    wordCount: 100,
    purpose: '',
    recipientContext: '',
    keyPoints: '',
    tone: '',
    urgencyLevel: '',
    cta: '',
}