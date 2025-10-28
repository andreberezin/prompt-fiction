import copyToClipboard from "../../utils/copyToClipboard.ts";
import {AiOutlineCopy} from "react-icons/ai";
import type {FormatType} from "../../types/FormatType.ts";
import {useState} from "react";
import type {HasExportFormats} from "../../types/HasExportFormats.ts";
import * as React from "react";

interface TextFormatProps<T extends HasExportFormats> {
    format: FormatType;
    error: string;
    status: string;
    loadingState: boolean;
    response: T;
    currentOutputContent: string;
    currentFormat: {markdown: boolean, plainText: boolean, richText: boolean};
    handleChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function TextFormat<T extends HasExportFormats>({format, error, status, loadingState, response, currentOutputContent, handleChange}: TextFormatProps<T>) {
    const [copyText, setCopyText] = useState<string>("Copy");

    return (
            <div className='textarea-container'>
                        <textarea
                            id={`${format}-text`}
                            className={`output-text ${error ? "error" : (loadingState ? "loading" : "")}`}
                            value={
                                format === "markdown"
                                    ? (error || status || response.exportFormats?.markdown || "")
                                    : (response.exportFormats?.[format] ?? "")
                            }
                            readOnly={format !== 'markdown'}
                            onChange={format === 'markdown' ? handleChange : undefined}
                        />

                <button
                    id='copy-button'
                    className='hover-icon-button'
                    data-tooltip={copyText}
                    disabled={loadingState}
                    onClick={() => copyToClipboard(currentOutputContent, setCopyText)}
                >
                    <AiOutlineCopy className='icon'/>
                </button>
            </div>
    )
}