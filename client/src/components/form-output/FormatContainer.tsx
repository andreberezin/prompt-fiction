import toggleFormat from "../../utils/form-output/toggleFormat.ts";
import {AiOutlineFile, AiOutlineFileMarkdown, AiOutlineFilePdf} from "react-icons/ai";
import downloadPdf from "../../utils/api/downloadPdf.ts";
import * as React from "react";
import type {FormatOptions} from "../../types/form-output/FormatType.ts";
import type {HasExportFormats} from "../../types/props/HasExportFormats.ts";
import type {ContentType} from "../../types/ContentType.ts";

interface FormatContainerProps<T extends HasExportFormats> {
    loadingState: boolean;
    currentFormat: FormatOptions;
    setCurrentFormat: React.Dispatch<React.SetStateAction<FormatOptions>>;
    response: T;
    responseRef: React.RefObject<T>;
    setError: React.Dispatch<React.SetStateAction<string>>;
    richText?: boolean;
    markdown?: boolean;
    plainText?: boolean;
    pdf?: boolean;
    updateResponseObject: (e: React.MouseEvent<HTMLButtonElement>) => void;
    contentType: ContentType;
}

export function FormatContainer<T extends HasExportFormats>({loadingState, currentFormat, setCurrentFormat, response, responseRef, setError, updateResponseObject, richText = false, markdown = false, plainText = false, pdf = false, contentType}: FormatContainerProps<T>) {

    return (
        <div id='format-container'>
            {markdown &&
				<button
					id='markdown-button'
					data-tooltip='Markdown'
					disabled={loadingState}
					className={`hover-icon-button ${currentFormat.markdown ? "active" : ""}`}
					onClick={() => {toggleFormat("markdown", currentFormat, setCurrentFormat)}}
				>
					<AiOutlineFileMarkdown className='icon'/>
				</button>
            }
            {plainText &&
				<button
					id='plain-text-button'
					data-tooltip='Plain text'
					disabled={loadingState}
					className={`hover-icon-button ${currentFormat.plainText ? "active" : ""}`}
					onClick={() => {toggleFormat("plainText", currentFormat, setCurrentFormat)}}
				>
					<AiOutlineFile className='icon'/>
				</button>
            }

            {richText &&
				<button
					id='rich-text-button'
					data-tooltip='Rich text'
					disabled={loadingState}
					className={`hover-icon-button ${currentFormat.richText ? "active" : ""}`}
					onClick={() => {toggleFormat("richText", currentFormat, setCurrentFormat)}}
				>
					<AiOutlineFile className='icon'/>
				</button>}

            {pdf &&
				<button
					id='pdf-download-button'
					data-tooltip='Download pdf'
					disabled={loadingState || !response.exportFormats.pdfReady}
					className={`hover-icon-button ${!response.exportFormats.pdfReady ? "disabled" : ""}`}
					onClick={ async(e) => {
                        await updateResponseObject(e);
                        await downloadPdf({responseRef, setError, contentType});
                    }}
				>
					<AiOutlineFilePdf className='icon'/>
				</button>
            }

        </div>
    )
}