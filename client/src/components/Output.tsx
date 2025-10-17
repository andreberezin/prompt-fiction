import '../styles/output.scss'
import '../styles/hover-icon-button.scss'
import * as React from "react";
import type OutputType from "../types/output.ts"
import {AiOutlineCopy, AiOutlineFile, AiOutlineFileMarkdown, AiOutlineFilePdf} from "react-icons/ai";
import {useState} from "react";
import {RiFullscreenExitFill, RiFullscreenFill} from "react-icons/ri";

interface OutputProps {
    output: OutputType;
    setOutput: React.Dispatch<React.SetStateAction<OutputType>>;
    loadingState: boolean;
    error: string;
    showForm: boolean;
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Output({output, setOutput, loadingState, error, showForm, setShowForm}: OutputProps) {
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

    // function recountWords() {
    //
    // }

    // function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    //     const newValue = e.target.value;
    //
    //     if (currentFormat === "markdown") {
    //         setOutput({
    //             ...output,
    //             exportFormats: {
    //                 markdown: newValue,
    //                 plainText: newValue.replace(/[*_#`>~\-]/g, ""), // crude Markdown stripper
    //             },
    //         });
    //     } else {
    //         setOutput({
    //             ...output,
    //             exportFormats: {
    //                 plainText: newValue,
    //                 markdown: newValue, // just mirror for now
    //             },
    //         });
    //     }
    // }

    return (
        <div
            id={`output-container`}
            className={`${error ? "error" : loadingState ? "loading" : ""} ${!showForm ? "fullscreen" : ""}`}
            tabIndex={0}
        >
            <div id='format-container'>
                <div id='buttons-container'>
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
                        disabled={loadingState}
                        className={`hover-icon-button`}
                        // onClick={downloadPdf}
                    >
                        <AiOutlineFilePdf className='icon'/>
                    </button>
                </div>

                {/*todo update word count when content is edited*/}
                <div id='metadata-container'>
                    <div className='data'>
                        <p id='value'>{output.metadata?.wordCount || 0}</p>
                        <p id='text'>words</p>
                    </div>
                    <div className='data'>
                        <p id='value'>{output.metadata?.estimatedReadTime || "0 min"}</p>
                        <p id='text'>read time</p>
                    </div>
                </div>

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

            <div id='textareas-container'>
                {currentFormat.markdown &&

                    // todo make it so when one is edited the other stays in sync
                    // todo make into a component because it's used twice
                    <div className='textarea-container'>
                        <textarea
                            id='markdown-text'
                            className={`output-text ${error ? "error" : (loadingState ? "loading" : "")}`}
                            // value={error !== "" ? error : (output.exportFormats?.markdown ? output.exportFormats.markdown : "") || ""}
                            // value={error ? error : currentOutputContent}
                            // value={error ? error : output.exportFormats?.markdown || ""}
							value={
                                error
                                    ? error
                                    : (
                                        output.exportFormats?.markdown || ""
                                    ) +
                                    (
                                        output.metadata?.seoKeywords?.length
                                            ? `\n\nSeo keywords:\n${output.metadata.seoKeywords}`
                                            : ""
                                    )
                            }
                            readOnly={error !== ""}
                            // onChange={(e) =>
                            //     setOutput({...output, title: e.target.value })
                            // }
                            onChange={(e) =>
                                setOutput({ ...output, exportFormats: { ...output.exportFormats, markdown: e.target.value } })
                            }
                        >
                </textarea>
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
                                // value={error !== "" ? error : (output.exportFormats?.markdown ? output.exportFormats.markdown : "") || ""}
								value={
                                    error
                                        ? error
                                        : (
                                            output.exportFormats?.plainText || ""
                                        ) +
                                        (
                                            output.metadata?.seoKeywords?.length
                                                ? `\n\nSeo keywords:\n${output.metadata.seoKeywords}`
                                                : ""
                                        )
                                }
                                readOnly={error !== ""}
                                // onChange={(e) =>
                                //     setOutput({...output, title: e.target.value })
                                // }
                                onChange={(e) =>
                                    setOutput({ ...output, exportFormats: { ...output.exportFormats, plainText: e.target.value } })
                                }
                            >
                </textarea>
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
            </div>
        </div>
    )
}