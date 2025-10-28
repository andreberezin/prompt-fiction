import '../../styles/output.scss'
import '../../styles/hover-icon-button.scss'
import * as React from "react";
import {AiOutlineCopy, AiOutlineFile, AiOutlineFileMarkdown, AiOutlineFilePdf} from "react-icons/ai";
import {useState} from "react";
import {RiFullscreenExitFill, RiFullscreenFill} from "react-icons/ri";
import {SEOkeywords} from "./SEOkeywords.tsx";
import {TbReload, TbSeo} from "react-icons/tb";
import type {Client} from "@stomp/stompjs";
import type BlogResponseType from "../../types/BlogResponse.ts";
import copyToClipboard from "../../utils/copyToClipboard.ts";
import toggleFormat from "../../utils/toggleFormat.ts";
import useAutoUpdateResponse from "../../hooks/useAutoUpdateResponse.ts";
import downloadPdf from "../../utils/downloadPdf.ts";

interface OutputProps {
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
    stompClient: React.RefObject<Client | null>;
    blogResponseRef: React.RefObject<BlogResponseType>;
}

export default function BlogOutput({blogResponse, setBlogResponse, loadingState, error, showForm, setShowForm, generationTime, setError, isTextEdited, setIsTextEdited, updateResponseObject, showSEO, setShowSEO, retryCounter, status, stompClient, blogResponseRef}: OutputProps) {
    const [copyText, setCopyText] = useState<string>("Copy");
    const [currentFormat, setCurrentFormat] = useState<{markdown: boolean, plainText: boolean}>({markdown: true, plainText: false});

    const currentOutputContent =
        currentFormat.markdown ? blogResponse.exportFormats?.markdown || "" : blogResponse.exportFormats?.plainText || "";


    const handleAutoUpdateResponse = useAutoUpdateResponse({
        contentType: 'blog',
        stompClient,
        responseRef: blogResponseRef,
        debounceDelay: 10, // optional
    });

    return (
        <div
            id={`output-container`}
            className={`${error ? "error" : loadingState ? "loading" : ""} ${!showForm ? "fullscreen" : ""}`}
            tabIndex={0}
        >
            <div id='upper-container'>
                <div id='format-container'>
                    <button
                        id='markdown-button'
                        data-tooltip='Markdown'
                        disabled={loadingState}
                        className={`hover-icon-button ${currentFormat.markdown ? "active" : ""}`}
                        onClick={() => {toggleFormat("markdown", currentFormat, setCurrentFormat)}}
                    >
                        <AiOutlineFileMarkdown className='icon'/>
                    </button>
                    <button
                        id='plain-text-button'
                        data-tooltip='Plain text'
                        disabled={loadingState}
                        className={`hover-icon-button ${currentFormat.plainText ? "active" : ""}`}
                        onClick={() => {toggleFormat("plainText", currentFormat, setCurrentFormat)}}
                    >
                        <AiOutlineFile className='icon'/>
                    </button>
                    <button
                        id='pdf-download-button'
                        data-tooltip='Download pdf'
                        disabled={loadingState || !blogResponse.exportFormats.pdfReady}
                        className={`hover-icon-button ${!blogResponse.exportFormats.pdfReady ? "disabled" : ""}`}
                        onClick={ async(e) => {
                            await updateResponseObject(e);
                            await downloadPdf({blogResponseRef, setError});
                        }}
                    >
                        <AiOutlineFilePdf className='icon'/>
                    </button>
                </div>

                {/*todo update word count when content is edited*/}
                <div id='metadata-container'>
                    <div className='data'>
                        <p className='value'
                           id='generation-timer'
                           data-attemptcount={retryCounter}
                        >
                            {generationTime > 0 ? (generationTime / 1000).toFixed(2) : "0.00"}
                        </p>
                    </div>
                    <div className='data'>
                        <p className='value'>{blogResponse.metadata?.wordCount || 0}</p>
                        <p className='text'>words</p>
                    </div>
                    <div className='data'>
                        <p className='value'>{blogResponse.metadata?.estimatedReadTime || "0 min"}</p>
                        <p className='text'>read</p>
                    </div>
                </div>

                <div id='button-container'>
                    <button
                        id='refresh-button'
                        data-tooltip='Update'
                        className={`hover-icon-button ${!isTextEdited? "disabled" : "flash"}`}
                        disabled={!isTextEdited}
                        onClick={(e) => updateResponseObject(e)}
                    >
                        <TbReload className='icon'/>
                    </button>
                    <button
                        id='seo-button'
                        data-tooltip='SEO keywords'
                        className={`hover-icon-button ${blogResponse.metadata.seoKeywords.length === 0 ? "disabled" : ""} ${showSEO ? "active" : ""}`}
                        disabled={blogResponse.metadata.seoKeywords.length === 0}
                        onClick={() => setShowSEO(!showSEO)}
                    >
                        <TbSeo className='icon'/>
                    </button>
                    <button
                        id='fullscreen-button'
                        data-tooltip='Fullscreen'
                        className='hover-icon-button'
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm &&  <RiFullscreenFill className='icon'/>}
                        {!showForm &&  <RiFullscreenExitFill className='icon'/>}
                    </button>
                </div>

            </div>

            <div
                id='lower-container'
            >
                <div id='textareas-container'>
                    {currentFormat.markdown &&
						<div className='textarea-container'>
                        <textarea
							id='markdown-text'
							className={`output-text ${error ? "error" : (loadingState ? "loading" : "")}`}
							value={error ? error : (status ? status: (blogResponse.exportFormats.markdown ? blogResponse.exportFormats.markdown : ""))}
							readOnly={error !== "" || status !== ""}
							onChange={(e) => {
                                setBlogResponse(prev => ({
                                    ...prev,
                                    exportFormats: { ...prev.exportFormats, markdown: e.target.value }
                                }));
                                setIsTextEdited(true);
                                handleAutoUpdateResponse();
                            }
                            }
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

                    }
                    {currentFormat.plainText && !error && !loadingState &&
						<div className='textarea-container'>
                            <textarea
								id='plainText-text'
								className={`output-text ${error ? "error" : (loadingState ? "loading" : "")}`}
								value={blogResponse.exportFormats?.plainText ? blogResponse.exportFormats.plainText : ""}
                                readOnly={true}
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
                    }
                    {showSEO && <SEOkeywords keywords={blogResponse.metadata?.seoKeywords} />}
                </div>
                {/*<OutputSideMenu/>*/}
            </div>
        </div>
    )
}