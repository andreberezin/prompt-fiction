import * as React from "react";
import type BlogResponseType from "../types/BlogResponseType.ts";

export default function resetBlogResponseObject (
    setResponse: React.Dispatch<React.SetStateAction<BlogResponseType>>): void{
        setResponse({
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
                pdfReady: false,
            },
            content: '',
            attempts: 0,
        })
}