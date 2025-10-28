import * as React from "react";
import type EmailResponseType from "../types/EmailResponseType.ts";

export default function resetEmailResponseObject (
    setResponse: React.Dispatch<React.SetStateAction<EmailResponseType>>): void{
        setResponse({
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
        })
}