import '../../styles/aimodels.scss'
import * as React from "react";
import type BlogRequest from "../../types/BlogRequest.ts";
import {type AIMODELObject, AImodels} from "../../types/AImodels.ts";

interface AImodelProps {
    blogRequest: BlogRequest;
    setBlogRequest: React.Dispatch<React.SetStateAction<BlogRequest>>,
}

const renderAImodels = ({ blogRequest, setBlogRequest }: AImodelProps) => {

    return AImodels.map((modelObj: AIMODELObject) => (
        <label
            key={modelObj.model}
            className={`aimodel-button ${
                blogRequest.aimodel.model === modelObj.model ? "active" : "inactive"
            }`}
            data-tooltip={modelObj.tooltip}
        >
            <input
                type='radio'
                name='aimodel'
                checked={blogRequest.aimodel.model === modelObj.model}
                value={modelObj.model}
                onChange={() => {
                    setBlogRequest({
                        ...blogRequest,
                        aimodel: {
                            ...blogRequest.aimodel,
                            model: modelObj.model,
                        },
                    });
                }}

            />
            {modelObj.model}
        </label>
    ));
};



export default function AImodelChoice(props: AImodelProps) {

    return (
        <div
            className='aimodel-container'
        >
            {renderAImodels(props)}
        </div>
    )
}