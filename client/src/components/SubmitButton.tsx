import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import '../styles/buttons.scss'

export default function SubmitButton() {

    return (
        <div
        className='submit-container button-container'
        >
            <button
                type='submit'
                className='submit'
            >
                <MdKeyboardDoubleArrowRight className='submit-icon icon'/>
            </button>
        </div>
    )
}