import { RiDeleteBin2Line } from "react-icons/ri";
import '../../styles/buttons/clearAndSubmitButtons.scss'
import * as React from "react";


interface ClearButtonProps<T> {
    setRequest: React.Dispatch<React.SetStateAction<T>>,
    loadingState: boolean;
    resetValue: T;
}


export default function ClearButton<T>({setRequest, loadingState, resetValue}: ClearButtonProps<T>) {

    const handleClear = () => {
        // Reset the request state
        setRequest(resetValue);

        // Find all input elements with "filled" class and remove the class
        const filledInputs = document.querySelectorAll<HTMLLabelElement>('label.filled');
        filledInputs.forEach(input => input.classList.remove('filled'));
    };

    return (
        <div
            className='clear-container button-container'
        >
            <button
                type='button'
                id='clear-button'
                className={`${loadingState ? "disabled" : ""}`}
                disabled={loadingState}
                onClick={handleClear}
            >
                <RiDeleteBin2Line className='icon' id={'clear-icon'}/>
            </button>
        </div>
    )
}