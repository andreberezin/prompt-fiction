import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import '../styles/buttons.scss'

export default function StopButton() {

    return (
        <div
            className='stop-container button-container'
        >
            <button
                type='button'
                className='stop'
            >
                <MdKeyboardDoubleArrowRight className='stop-icon icon'/>
            </button>
        </div>
    )
}