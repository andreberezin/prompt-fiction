import '../../styles/buttons/aimodels.scss'
import * as React from "react";
import {type AIMODELObject, AImodels} from "../../types/AImodels.ts";
import type {HasAImodel} from "../../types/props/HasAImodel.ts";


interface AImodelProps<T extends HasAImodel> {
    request: T;
    setRequest: React.Dispatch<React.SetStateAction<T>>,
}

const renderAImodels =  <T extends HasAImodel> ({ request, setRequest }: AImodelProps<T>) => {

    // todo on narrower screens make the text shorter so it doesn't go on 2 lines
    return AImodels.map((modelObj: AIMODELObject) => (
        <label
            key={modelObj.model}
            className={`aimodel-button ${
                request.aimodel.model === modelObj.model ? "active" : "inactive"
            }`}
            data-tooltip={modelObj.tooltip}
        >
            <input
                type='radio'
                name='aimodel'
                checked={request.aimodel.model === modelObj.model}
                value={modelObj.model}
                onChange={() => {
                    setRequest({
                        ...request,
                        aimodel: {
                            ...request.aimodel,
                            model: modelObj.model,
                        },
                    });
                }}

            />
            <span className="model-full">{modelObj.model}</span>
            <span className="model-short">{modelObj.short}</span>
        </label>
    ));
};



export default function AImodelChoice<T extends HasAImodel>(props: AImodelProps<T>) {

    return (
        <div
            className='aimodel-container'
        >
            {renderAImodels(props)}
        </div>
    )
}