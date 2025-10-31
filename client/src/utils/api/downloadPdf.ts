import axios from "axios";
import * as React from "react";
import type {ContentType} from "../../types/form-input/ContentType.ts";

interface DownloadPdfProps<T> {
    responseRef: React.RefObject<T>;
    setError: React.Dispatch<React.SetStateAction<string>>;
    contentType: ContentType;
}

export default async function downloadPdf<T> ({responseRef, setError, contentType}: DownloadPdfProps<T>) {

    try {
        const response = await axios.post(
            `/api/${contentType}/pdf`,
            responseRef.current,
            {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'blob',
            }
        );

        const contentDisposition = response.headers['content-disposition'];
        let fileName = `Ghostwriter_${contentType}.pdf`;

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