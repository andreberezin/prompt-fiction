import {MdKeyboardDoubleArrowRight} from "react-icons/md";
import '../styles/buttons.scss'
import type BlogFormData from "../types/blogFormData.ts";

interface SubmitButtonProps {
    loadingState: boolean;
    cancelRequest: () => void;
    blogFormData: BlogFormData;
}

export default function SubmitButton({loadingState, blogFormData}: SubmitButtonProps) {

    const invalidContent:boolean =
        !blogFormData.topic || blogFormData.topic === "" ||
        !blogFormData.tone || blogFormData.tone === "" ||
        !blogFormData.targetAudience || blogFormData.targetAudience === "" ||
        !blogFormData.expertiseLevel || blogFormData.expertiseLevel === "";

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