import { RiDeleteBin2Line } from "react-icons/ri";
import '../styles/buttons.scss'
import * as React from "react";
import type BlogFormData from "../types/blogFormData.ts";

interface ClearButtonProps {
    setBlogFormData: React.Dispatch<React.SetStateAction<BlogFormData>>;
}


export default function ClearButton({setBlogFormData}: ClearButtonProps) {

    return (
        <div
            className='clear-container button-container'
        >
            <button
                type='button'
                className='clear'
                onClick={() => {
                    setBlogFormData({
                        contentType: "blog",
                        topic: '',
                        targetAudience: '',
                        tone: '',
                        expertiseLevel: '',
                        wordCount: 1000,
                        seoFocus: false,
                    })
                }}
            >
                <RiDeleteBin2Line className='clear-icon icon'/>
            </button>
        </div>
    )
}