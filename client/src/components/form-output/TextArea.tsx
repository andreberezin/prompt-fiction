import useAutoUpdateResponse from "../../hooks/useAutoUpdateResponse.ts";
import {useSocket} from "../context/useSocket.tsx";
import * as React from "react";
import {SEOkeywords} from "./SEOkeywords.tsx";
import type {HasExportFormats} from "../../types/HasExportFormats.ts";
import type {HasMetaData} from "../../types/HasMetadata.ts";
import {TextFormat} from "./TextFormat.tsx";
import type {FormatOptions} from "../../types/FormatType.ts";


interface TextAreaProps<T extends HasExportFormats & HasMetaData> {
    currentFormat: FormatOptions;
    response: T;
    setResponse: React.Dispatch<React.SetStateAction<T>>;
    responseRef: React.RefObject<T>;
    status: string;
    error: string;
    setIsTextEdited: React.Dispatch<React.SetStateAction<boolean>>;
    loadingState: boolean;
    showSEO: boolean;
}

export function TextArea<T extends HasExportFormats & HasMetaData>({currentFormat, response, setResponse, responseRef, status, error,
                            setIsTextEdited, loadingState, showSEO}: TextAreaProps<T>) {
    const {stompClient} = useSocket();

    const currentOutputContent =
        currentFormat.markdown ? response.exportFormats?.markdown || "" : response.exportFormats?.plainText || "";

    const hasSeo = Boolean(response?.metadata?.seoKeywords?.length);

    const handleAutoUpdateResponse = useAutoUpdateResponse({
        contentType: 'blog',
        stompClient,
        responseRef: responseRef,
        debounceDelay: 10, // optional
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResponse(prev => ({
            ...prev,
            exportFormats: { ...prev.exportFormats, markdown: e.target.value }
        }));
        setIsTextEdited(true);
        handleAutoUpdateResponse();
    }

    return (
            <div id='textareas-container'>
                {currentFormat.markdown &&
					<TextFormat
                        format={'markdown'}
                        error={error}
                        status={status}
                        loadingState={loadingState}
                        response={response}
                        currentOutputContent={currentOutputContent}
                        currentFormat={currentFormat}
                        handleChange={handleChange}
                    />

                }
                {currentFormat.plainText && !error && !loadingState &&
                    <TextFormat
                        format={'plainText'}
                        error={error}
                        status={status}
                        loadingState={loadingState}
                        response={response}
                        currentOutputContent={currentOutputContent}
                        currentFormat={currentFormat}
                    />
                }
                {/*todo implement the rich text format*/}
                {currentFormat.richText && !error && !loadingState &&
					<TextFormat
						format={'richText'}
						error={error}
						status={status}
						loadingState={loadingState}
						response={response}
						currentOutputContent={currentOutputContent}
						currentFormat={currentFormat}
					/>
                }
                {hasSeo && showSEO && <SEOkeywords keywords={response.metadata?.seoKeywords} />}
            </div>
    )
}