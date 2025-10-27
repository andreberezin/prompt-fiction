import {MdKeyboardDoubleArrowRight} from "react-icons/md";
import '../styles/buttons.scss'
import type BlogRequest from "../types/BlogRequest.ts";

interface SubmitButtonProps {
    loadingState: boolean;
    cancelRequest: () => void;
    request: BlogRequest;
}

// @ts-expect-error cancelRequest is here for later use
export default function SubmitButton({loadingState, cancelRequest, request}: SubmitButtonProps) {

    const invalidContent:boolean =
        !request.topic || request.topic === "" ||
        !request.tone || request.tone === "" ||
        !request.targetAudience || request.targetAudience === "" ||
        !request.expertiseLevel || request.expertiseLevel === "";

    return (
        <div
        className='submit-container button-container'
        >
            <button
                // todo disable if some fields are empty
                type='submit'
                id={'submit-button'}
                className={`${(loadingState || invalidContent) ? "disabled" : ""}`}
                disabled={loadingState || invalidContent}
            >
                <MdKeyboardDoubleArrowRight className='icon' id={'submit-icon'}/>
            </button>
            {/*todo add a button to cancel the request*/}
            {/*{!loadingState ? (*/}
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