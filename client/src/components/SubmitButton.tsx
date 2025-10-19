import {MdCancelPresentation, MdKeyboardDoubleArrowRight} from "react-icons/md";
import '../styles/buttons.scss'

interface SubmitButtonProps {
    loadingState: boolean;
    cancelRequest: () => void;
}

export default function SubmitButton({loadingState}: SubmitButtonProps) {

    return (
        <div
        className='submit-container button-container'
        >
            <button
                // todo disable if some fields are empty
                type='submit'
                id={'submit-button'}
                className={`${loadingState ? "disabled" : ""}`}
                disabled={loadingState}
            >
                <MdKeyboardDoubleArrowRight className='icon' id={'submit-icon'}/>
            </button>
            {/*{!loadingState ? (*/}
            {/*    <button*/}
            {/*        // todo disable if some fields are empty*/}
            {/*        type='submit'*/}
            {/*        id={'submit-button'}*/}
            {/*        className={`${loadingState ? "disabled" : ""}`}*/}
            {/*        disabled={loadingState}*/}
            {/*    >*/}
            {/*        <MdKeyboardDoubleArrowRight className='icon' id={'submit-icon'}/>*/}
            {/*    </button>*/}
            {/*) : (*/}
            {/*    <button*/}
            {/*        type='submit'*/}
            {/*        id={'cancel-button'}*/}
            {/*        // className={`${loadingState ? "disabled" : ""}`}*/}
            {/*        // disabled={loadingState}*/}
            {/*        onClick={cancelRequest}*/}
            {/*    >*/}
            {/*        <MdCancelPresentation className={'icon'} id={'cancel-icon'}/>*/}
            {/*    </button>*/}
            {/*)}*/}
        </div>
    )
}