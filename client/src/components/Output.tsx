import '../styles/output.scss'
import '../styles/hover-icon-button.scss'
import * as React from "react";
import type OutputType from "../types/output.ts"
import {AiOutlineCopy, AiOutlineFile, AiOutlineFileMarkdown, AiOutlineFilePdf} from "react-icons/ai";
import {useState} from "react";
import {RiFullscreenExitFill, RiFullscreenFill} from "react-icons/ri";
import axios from "axios";
import {SEOkeywords} from "./SEOkeywords.tsx";
import {TbReload, TbSeo} from "react-icons/tb";

interface OutputProps {
    output: OutputType;
    setOutput: React.Dispatch<React.SetStateAction<OutputType>>;
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
    showCEO: boolean;
    setShowCEO: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Output({output, setOutput, loadingState, error, showForm, setShowForm, generationTime, setError, isTextEdited, setIsTextEdited, updateOutput, showCEO, setShowCEO}: OutputProps) {
    const [copyText, setCopyText] = useState<string>("Copy");

    const [currentFormat, setCurrentFormat] = useState<{markdown: boolean, plainText: boolean}>({markdown: true, plainText: false});

    const currentOutputContent =
        currentFormat.markdown ? output.exportFormats?.markdown || "" : output.exportFormats?.plainText || "";

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

    const downloadPdf= async () => {

        try {
            const response = await axios.post('api/blog/pdf', output, {responseType: 'blob'});

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



    // todo update word count live
    // const updateWordCount = () => {
    //     for () {
    //
    //     }
    // }

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
                        disabled={loadingState || !output.exportFormats.pdfReady}
                        className={`hover-icon-button ${!output.exportFormats.pdfReady ? "disabled" : ""}`}
                        onClick={downloadPdf}
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
                        <p className='value' id='generation-timer'>{generationTime > 0 ? generationTime / 1000 : "0.00"}</p>
                        {/*<p className='text'>gen</p>*/}
                    </div>
                    <div className='data'>
                        <p className='value'>{output.metadata?.wordCount || 0}</p>
                        <p className='text'>words</p>
                    </div>
                    <div className='data'>
                        <p className='value'>{output.metadata?.estimatedReadTime || "0 min"}</p>
                        <p className='text'>read</p>
                    </div>
                </div>

                <div id='button-container'>
                    <button
                        id='refresh-button'
                        data-tooltip='Update'
                        className={`hover-icon-button ${!isTextEdited? "disabled" : "flash"}`}
                        disabled={!isTextEdited}
                        onClick={() => updateOutput()}
                    >
                        <TbReload className='icon'/>
                    </button>
                    <button
                        id='seo-button'
                        data-tooltip='SEO keywords'
                        className={`hover-icon-button ${output.metadata.seoKeywords.length === 0 ? "disabled" : ""} ${showCEO ? "active" : ""}`}
                        disabled={output.metadata.seoKeywords.length === 0}
                        onClick={() => setShowCEO(!showCEO)}
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
							value={error ? error : (output.exportFormats.markdown ? output.exportFormats.markdown : "")}
							readOnly={error !== ""}
							onChange={(e) => {
                                setOutput({ ...output, exportFormats: { ...output.exportFormats, markdown: e.target.value } });
                                setIsTextEdited(true);
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
                    {currentFormat.plainText && !error &&
						<div className='textarea-container'>
                            <textarea
								id='plainText-text'
								className={`output-text ${error ? "error" : (loadingState ? "loading" : "")}`}
								value={error !== "" ? error : (output.exportFormats?.plainText ? output.exportFormats.plainText : "") || ""}
                                readOnly={true}
								onChange={(e) =>
                                    // handleEditSection()
                                    setOutput({
                                        ...output,
                                        exportFormats: {
                                            ...output.exportFormats,
                                            plainText: e.target.value,
                                            // pdfReady: false,
                                        }
                                    })
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
                    {/* todo make SEO keywords toggleable */}
                    {showCEO && <SEOkeywords keywords={output.metadata?.seoKeywords} />}
                </div>
                {/*<OutputSideMenu/>*/}
            </div>
        </div>
    )
}