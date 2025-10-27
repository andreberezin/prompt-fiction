import axios from "axios";
import * as React from "react";
import type BlogResponseType from "../types/BlogResponse.ts";

interface DownloadPdfProps{
    blogResponseRef: React.RefObject<BlogResponseType>;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

export default async function downloadPdf ({blogResponseRef, setError}: DownloadPdfProps) {

    try {
        const response = await axios.post(
            '/api/blog/pdf',
            blogResponseRef.current,
            {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'blob',
            }
        );

        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'Ghostwriter_blogPost.pdf';

        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (fileNameMatch && fileNameMatch.length > 1) {
                fileName = fileNameMatch[1];
            }
        }

        // Create a temporary download link
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // cleanup
        link.remove();
        URL.revokeObjectURL(url);
    } catch (err: unknown) {
        console.error(`Unexpected error: ${err}`);
        setError(`${err}`)
    }
}