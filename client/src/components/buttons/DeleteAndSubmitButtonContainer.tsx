import SubmitButton from "./SubmitButton.tsx";
import ClearButton from "./ClearButton.tsx";
import * as React from "react";

interface DeleteAndSubmitButtonContainerProps<T> {
    loadingState: boolean;
    setRequest: React.Dispatch<React.SetStateAction<T>>;
    resetValue: T;
    isValid: boolean;
}

export default function DeleteAndSubmitButtonContainer<T>({loadingState, setRequest, resetValue, isValid}: DeleteAndSubmitButtonContainerProps<T>) {
    return (
        <div className='form-buttons-container'>
            <SubmitButton loadingState={loadingState} isValid={isValid}/>
            <ClearButton loadingState={loadingState} setRequest={setRequest} resetValue={resetValue}/>
        </div>
    )
}