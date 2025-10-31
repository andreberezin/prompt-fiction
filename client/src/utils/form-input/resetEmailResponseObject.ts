import * as React from "react";
import type EmailResponseType from "../../types/form-output/EmailResponseType.ts";

export default function resetEmailResponseObject (
    setResponse: React.Dispatch<React.SetStateAction<EmailResponseType>>): void{
        setResponse({
            subject: '',
            body: '',
            content: '',
            sections: [],
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