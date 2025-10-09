import '../styles/aimodels.scss'
import * as React from "react";
import type BlogFormData from "../types/blogFormData.ts";
import {AIMODELS} from "../types/aimodels.ts";

interface AImodelProps {
    blogFormData: BlogFormData,
    setBlogFormData: React.Dispatch<React.SetStateAction<BlogFormData>>,
}

const renderAImodels = ({ blogFormData, setBlogFormData }: AImodelProps) => {
    return AIMODELS.map((aimodel) => (
        <label
            key={aimodel}
            className={`aimodel-button ${
                blogFormData.aimodel === aimodel ? "active" : "inactive"
            }`}
        >
            <input
                type='radio'
                name='aimodel'
                checked={blogFormData.aimodel === aimodel}
                value={aimodel}
                onChange={() => {
                    setBlogFormData({...blogFormData, aimodel: aimodel});
                }}
            />
            {aimodel}
        </label>
    ));
};



export default function AImodel(props: AImodelProps) {

    return (
        <div
            className='aimodel-container'
        >
            {renderAImodels(props)}
        </div>
    )
}