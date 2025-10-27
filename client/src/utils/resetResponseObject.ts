import type {ContentType} from "../types/ContentType.ts";
import * as React from "react";
import type BlogResponseType from "../types/BlogResponse.ts";

export default function resetResponseObject (
    type: ContentType,
    setResponse: React.Dispatch<React.SetStateAction<BlogResponseType>>): void{
    if (type === "blog") {
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
    } else if (type === "email") {
        console.log("resetting email response object")
    }
}