import '../../styles/form-output/output.scss'
import '../../styles/form-output/outputLowerContainer.scss'
import '../../styles/form-output/outputUpperContainer.scss'
import '../../styles/buttons/HoverIconButtons.scss'
import * as React from "react";
import {useState} from "react";
import type BlogResponseType from "../../types/form-output/BlogResponseType.ts";
import {TextArea} from "./TextArea.tsx";
import type {FormatOptions} from "../../types/form-output/FormatType.ts";
import {FormatContainer} from "./FormatContainer.tsx";
import {MetadataContainer} from "./MetadataContainer.tsx";
import {ButtonContainer} from "./ButtonContainer.tsx";
import type {ContentType} from "../../types/form-input/ContentType.ts";

interface BlogOutputProps {
    blogResponse: BlogResponseType;
    setBlogResponse: React.Dispatch<React.SetStateAction<BlogResponseType>>;
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
    blogResponseRef: React.RefObject<BlogResponseType>;
    contentType: ContentType;
}

export default function BlogOutput({blogResponse, setBlogResponse, loadingState, error, showForm, setShowForm, generationTime, setError, isTextEdited, setIsTextEdited, updateResponseObject,
                                       showSEO, setShowSEO, retryCounter, status, blogResponseRef, contentType}: BlogOutputProps) {
    const [currentFormat, setCurrentFormat] = useState<FormatOptions>({markdown: true, plainText: false, richText: false});

    return (
        <div
            id={`output-container`}
            className={`${error ? "error" : loadingState ? "loading" : ""} ${!showForm ? "fullscreen" : ""}`}
            tabIndex={0}
        >
            <div id='upper-container'>
                <FormatContainer<BlogResponseType>
                    loadingState={loadingState}
                    currentFormat={currentFormat}
                    setCurrentFormat={setCurrentFormat}
                    response={blogResponse}
                    responseRef={blogResponseRef}
                    setError={setError}
                    markdown={true}
                    plainText={true}
                    richText={false}
                    pdf={true}
                    updateResponseObject={updateResponseObject}
                    contentType={contentType}
                />

                <MetadataContainer<BlogResponseType>
                    retryCounter={retryCounter}
                    generationTime={generationTime}
                    response={blogResponse}
                    wordCount={true}
                    estimateReadTime={true}
                    generationTimer={true}/>

                <ButtonContainer
                    isTextEdited={isTextEdited}
                    response={blogResponse}
                    showSEO={showSEO}
                    setShowSEO={setShowSEO}
                    showForm={showForm}
                    setShowForm={setShowForm}
                    updateResponseObject={updateResponseObject}
                    SEO={true}
                    refresh={true}
                    fullscreen={true}
                />

            </div>

            <div
                id='lower-container'
            >
                <TextArea<BlogResponseType>
                    currentFormat={currentFormat}
                    response={blogResponse}
                    setResponse={setBlogResponse}
                    responseRef={blogResponseRef}
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