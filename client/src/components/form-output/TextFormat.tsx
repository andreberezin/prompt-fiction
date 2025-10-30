import copyToClipboard from "../../utils/copyToClipboard.ts";
import {AiOutlineCopy} from "react-icons/ai";
import type {FormatType} from "../../types/FormatType.ts";
import {useState} from "react";
import type {HasExportFormats} from "../../types/HasExportFormats.ts";
import * as React from "react";
import type {HasSections} from "../../types/HasSections.ts";
import type {HasMetaData} from "../../types/HasMetadata.ts";

interface TextFormatProps<T extends HasExportFormats & HasMetaData & HasSections> {
    format: FormatType;
    error: string;
    status: string;
    loadingState: boolean;
    response: T;
    currentFormat: {markdown: boolean, plainText: boolean, richText: boolean};
    handleChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function TextFormat<T extends HasExportFormats & HasMetaData & HasSections>({format, error, status, loadingState, response, handleChange}: TextFormatProps<T>) {
    const [copyText, setCopyText] = useState<string>("Copy");

    // const combinedSections =
    //     response.sections?.length
    //         ? response.sections.map(s => s.plainTextContent || "").join("\n\n")
    //         : "";

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
                    onClick={() => copyToClipboard(response.exportFormats?.[format] ?? "", setCopyText)}
                >
                    <AiOutlineCopy className='icon'/>
                </button>
            </div>
    )
}