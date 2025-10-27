import '../styles/output.scss'
import '../styles/hover-icon-button.scss'
import * as React from "react";
import {AiOutlineCopy, AiOutlineFile, AiOutlineFileMarkdown, AiOutlineFilePdf} from "react-icons/ai";
import {useState} from "react";
import {RiFullscreenExitFill, RiFullscreenFill} from "react-icons/ri";
import axios from "axios";
import {SEOkeywords} from "./SEOkeywords.tsx";
import {TbReload, TbSeo} from "react-icons/tb";
import type {Client as StompClient} from "@stomp/stompjs";
import useDebounce from "../utils/debounce.ts";
import type BlogResponseType from "../types/BlogResponse.ts";

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    updateOutput: Function;
    showSEO: boolean;
    setShowSEO: React.Dispatch<React.SetStateAction<boolean>>;
    retryCounter: number;
    status: string;
    stompClient: React.RefObject<StompClient | null | undefined>;
    setIsEditingMarkdown: React.Dispatch<React.SetStateAction<boolean>>;
    blogResponseRef: React.RefObject<BlogResponseType>;
}

export default function Output({blogResponse, setBlogResponse, loadingState, error, showForm, setShowForm, generationTime, setError, isTextEdited, setIsTextEdited, updateOutput, showSEO, setShowSEO, retryCounter, status, stompClient, setIsEditingMarkdown, blogResponseRef}: OutputProps) {
    const [copyText, setCopyText] = useState<string>("Copy");
    const [currentFormat, setCurrentFormat] = useState<{markdown: boolean, plainText: boolean}>({markdown: true, plainText: false});

    const currentOutputContent =
        currentFormat.markdown ? blogResponse.exportFormats?.markdown || "" : blogResponse.exportFormats?.plainText || "";

    function copyToClipboard() {
        navigator.clipboard.writeText(currentOutputContent);
        setCopyText('Copied!')

        setTimeout(() => {
            setCopyText('Copy')
        }, 1500);
    }

    function toggleFormat(key: "markdown" | "plainText") {
        const activeCount = Object.values(currentFormat).filter(Boolean).length;
        if (activeCount === 1 && currentFormat[key]) return;
        setCurrentFormat({ ...currentFormat, [key]: !currentFormat[key] });
    }

    const downloadPdf = async () => {

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


    const handleUpdateOutput = useDebounce(() => {
        if (stompClient.current?.connected) {
            stompClient.current.publish({
                destination: "/app/blog/update-auto",
                body: JSON.stringify(blogResponseRef.current),
            });
        }
    }, 10);

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
                        onClick={() => {toggleFormat("markdown")}}
                    >
                        <AiOutlineFileMarkdown className='icon'/>
                    </button>
                    <button
                        id='plain-text-button'
                        data-tooltip='Plain text'
                        disabled={loadingState}
                        className={`hover-icon-button ${currentFormat.plainText ? "active" : ""}`}
                        onClick={() => {toggleFormat("plainText")}}
                    >
                        <AiOutlineFile className='icon'/>
                    </button>
                    <button
                        id='pdf-download-button'
                        data-tooltip='Download pdf'
                        disabled={loadingState || !blogResponse.exportFormats.pdfReady}
                        className={`hover-icon-button ${!blogResponse.exportFormats.pdfReady ? "disabled" : ""}`}
                        onClick={ async(e) => {
                            await updateOutput(e);
                            await downloadPdf();
                        }}
                    >
                        <AiOutlineFilePdf className='icon'/>
                    </button>
                </div>

                {/*<div id='timer-container'>*/}
                {/*    <div className='data'>*/}
                {/*        <p id='value'>{generationTime || 0}</p>*/}
                {/*        <p id='text'>generation time</p>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*todo update word count when content is edited*/}
                <div id='metadata-container'>
                    <div className='data'>
                        <p className='value'
                           id='generation-timer'
                           data-attemptcount={retryCounter}
                        >
                            {generationTime > 0 ? (generationTime / 1000).toFixed(2) : "0.00"}
                        </p>
                        {/*<p className='text' id='attempts-count'>{output.attempts || 0}</p>*/}
                        {/*<p className='text'>gen</p>*/}
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
                        onClick={(e) => updateOutput(e)}
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
                        // disabled={loadingState}
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

                        // todo make it so when one is edited the other stays in sync
                        // todo make into a component because it's used twice
						<div className='textarea-container'>
                        <textarea
							id='markdown-text'
							className={`output-text ${error ? "error" : (loadingState ? "loading" : "")}`}
							value={error ? error : (status ? status: (blogResponse.exportFormats.markdown ? blogResponse.exportFormats.markdown : ""))}
							readOnly={error !== "" || status !== ""}
							// onChange={(e) => {
                            //     setBlogResponse({ ...blogResponse, exportFormats: { ...blogResponse.exportFormats, markdown: e.target.value } });
                            //     setIsTextEdited(true);
                            //     handleUpdateOutput();
                            // }
                            // }
							onFocus={() => setIsEditingMarkdown(true)}
							onBlur={() => setIsEditingMarkdown(false)}
							onChange={(e) => {
                                setBlogResponse(prev => ({
                                    ...prev,
                                    exportFormats: { ...prev.exportFormats, markdown: e.target.value }
                                }));
                                setIsTextEdited(true);
                                handleUpdateOutput();
                            }
                            }
						/>

							<button
								id='copy-button'
								className='hover-icon-button'
								data-tooltip={copyText}
								disabled={loadingState}
								onClick={copyToClipboard}>
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
								onClick={copyToClipboard}>
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