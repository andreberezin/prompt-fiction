import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import '../styles/buttons.scss'

interface SubmitButtonProps {
    loadingState: boolean;
}

export default function SubmitButton({loadingState}: SubmitButtonProps) {

    return (
        <div
        className='submit-container button-container'
        >
            <button
                type='submit'
                className={`submit ${loadingState ? "disabled" : ""}`}
                disabled={loadingState}
            >
                <MdKeyboardDoubleArrowRight className='submit-icon icon'/>
            </button>
        </div>
    )
}