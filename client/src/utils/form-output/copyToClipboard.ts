import * as React from "react";

export default function copyToClipboard(currentOutputContent: string, setCopyText: React.Dispatch<React.SetStateAction<string>>) {
    navigator.clipboard.writeText(currentOutputContent)
    .then(() => { setCopyText('Copied!')});

    setTimeout(() => {
        setCopyText('Copy')
    }, 1500);
}