import { RiDeleteBin2Line } from "react-icons/ri";
import '../styles/buttons.scss'
import * as React from "react";
import type BlogFormData from "../types/blogFormData.ts";

interface ClearButtonProps {
    setBlogFormData: React.Dispatch<React.SetStateAction<BlogFormData>>,
    loadingState: boolean;
    // setOutput: React.Dispatch<React.SetStateAction<Output>;
}


export default function ClearButton({setBlogFormData, loadingState}: ClearButtonProps) {

    return (
        <div
            className='clear-container button-container'
        >
            <button
                type='button'
                id='clear-button'
                className={`${loadingState ? "disabled" : ""}`}
                disabled={loadingState}
                onClick={() => {
                    setBlogFormData({
                        aimodel: {model: "gemini-2.5-flash", tooltip: "Fast and intelligent"},
                        contentType: "blog",
                        topic: '',
                        targetAudience: '',
                        tone: '',
                        expertiseLevel: '',
                        wordCount: 1000,
                        seoFocus: false
                    })
                }}
            >
                <RiDeleteBin2Line className='icon' id={'clear-icon'}/>
            </button>
        </div>
    )
}