import SubmitButton from "./SubmitButton.tsx";
import ClearButton from "./ClearButton.tsx";
import type BlogRequestType from "../../types/BlogRequest.ts";
import * as React from "react";

interface DeleteAndSubmitButtonContainerProps {
    loadingState: boolean;
    request: BlogRequestType;
    setRequest: React.Dispatch<React.SetStateAction<BlogRequestType>>;
}

export default function DeleteAndSubmitButtonContainer({loadingState, request, setRequest}: DeleteAndSubmitButtonContainerProps) {
    return (
        <div className='button-container'>
            <SubmitButton loadingState={loadingState} request={request}/>
            <ClearButton loadingState={loadingState} setRequest={setRequest}/>
        </div>
    )
}