import '../../styles/form-output/output.scss'
import '../../styles/form-output/outputLowerContainer.scss'
import '../../styles/form-output/outputUpperContainer.scss'
import '../../styles/buttons/HoverIconButtons.scss'
import * as React from "react";
import {useState} from "react";
import {TextArea} from "./TextArea.tsx";
import type {FormatOptions} from "../../types/form-output/FormatType.ts";
import {FormatContainer} from "./FormatContainer.tsx";
import {MetadataContainer} from "./MetadataContainer.tsx";
import {ButtonContainer} from "./ButtonContainer.tsx";
import type EmailResponseType from "../../types/form-output/EmailResponseType.ts";
import type {ContentType} from "../../types/ContentType.ts";

interface EmailOutputProps {
    response: EmailResponseType;
    setResponse: React.Dispatch<React.SetStateAction<EmailResponseType>>;
    loadingState: boolean;
    error: string;
    showForm: boolean;
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
    generationTime: number;
    setError: React.Dispatch<React.SetStateAction<string>>;
    isTextEdited: boolean;
    setIsTextEdited: React.Dispatch<React.SetStateAction<boolean>>;
    updateResponseObject: (e: React.MouseEvent<HTMLButtonElement>) => void;
    showSEO: boolean;
    setShowSEO: React.Dispatch<React.SetStateAction<boolean>>;
    retryCounter: number;
    status: string;
    responseRef: React.RefObject<EmailResponseType>;
    contentType: ContentType;
}

export default function EmailOutput({response, setResponse, loadingState, error, showForm, setShowForm, generationTime, setError, isTextEdited, setIsTextEdited, updateResponseObject,
                                       showSEO, setShowSEO, retryCounter, status, responseRef, contentType}: EmailOutputProps) {
    const [currentFormat, setCurrentFormat] = useState<FormatOptions>({markdown: true, plainText: false, richText: false});

    return (
        <div
            id={`output-container`}
            className={`${error ? "error" : loadingState ? "loading" : ""} ${!showForm ? "fullscreen" : ""}`}
            tabIndex={0}
        >
            <div id='upper-container'>
                <FormatContainer
                    loadingState={loadingState}
                    currentFormat={currentFormat}
                    setCurrentFormat={setCurrentFormat}
                    response={response}
                    responseRef={responseRef}
                    setError={setError}
                    markdown={true}
                    plainText={true}
                    richText={false}
                    pdf={true}
                    updateResponseObject={updateResponseObject}
                    contentType={contentType}
                />

                <MetadataContainer
                    retryCounter={retryCounter}
                    generationTime={generationTime}
                    response={response}
                    wordCount={true}
                    estimateReadTime={true}
                    generationTimer={true}/>

                <ButtonContainer
                    isTextEdited={isTextEdited}
                    response={response}
                    showSEO={showSEO}
                    setShowSEO={setShowSEO}
                    showForm={showForm}
                    setShowForm={setShowForm}
                    updateResponseObject={updateResponseObject}
                    SEO={false}
                    refresh={true}
                    fullscreen={true}
                />

            </div>

            <div
                id='lower-container'
            >
                <TextArea
                    currentFormat={currentFormat}
                    response={response}
                    setResponse={setResponse}
                    responseRef={responseRef}
                    status={status}
                    error={error}
                    setIsTextEdited={setIsTextEdited}
                    loadingState={loadingState}
                    showSEO={showSEO}
                    contentType={contentType}
                />
            </div>
        </div>
    )
}