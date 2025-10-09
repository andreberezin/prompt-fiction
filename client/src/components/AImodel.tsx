import '../styles/aimodels.scss'
import * as React from "react";
import type BlogFormData from "../types/blogFormData.ts";
import {type AIMODELObject, AIMODELS} from "../types/aimodels.ts";

interface AImodelProps {
    blogFormData: BlogFormData,
    setBlogFormData: React.Dispatch<React.SetStateAction<BlogFormData>>,
}

const renderAImodels = ({ blogFormData, setBlogFormData }: AImodelProps) => {

    return AIMODELS.map((modelObj: AIMODELObject) => (
        <label
            key={modelObj.model}
            className={`aimodel-button ${
                blogFormData.aimodel.model === modelObj.model ? "active" : "inactive"
            }`}
            data-tooltip={modelObj.tooltip}
        >
            <input
                type='radio'
                name='aimodel'
                checked={blogFormData.aimodel.model === modelObj.model}
                value={modelObj.model}
                onChange={() => {
                    setBlogFormData({
                        ...blogFormData,
                        aimodel: {
                            ...blogFormData.aimodel,
                            model: modelObj.model,
                        },
                    });
                }}

            />
            {modelObj.model}
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