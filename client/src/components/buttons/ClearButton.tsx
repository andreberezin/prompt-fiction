import { RiDeleteBin2Line } from "react-icons/ri";
import '../../styles/clearAndSubmitButtons.scss'
import * as React from "react";


interface ClearButtonProps<T> {
    setRequest: React.Dispatch<React.SetStateAction<T>>,
    loadingState: boolean;
    resetValue: T;
}


export default function ClearButton<T>({setRequest, loadingState, resetValue}: ClearButtonProps<T>) {

    return (
        <div
            className='clear-container button-container'
        >
            <button
                type='button'
                id='clear-button'
                className={`${loadingState ? "disabled" : ""}`}
                disabled={loadingState}
                onClick={() => setRequest(resetValue)}
            >
                <RiDeleteBin2Line className='icon' id={'clear-icon'}/>
            </button>
        </div>
    )
}