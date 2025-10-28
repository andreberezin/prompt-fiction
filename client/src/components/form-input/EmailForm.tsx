import '../../styles/form.scss'
import type {BaseFormProps} from "../../types/BaseFormProps.ts";
import * as React from "react";
import type EmailResponseType from "../../types/EmailResponseType.ts";
import type EmailRequestType from "../../types/EmailRequestType.ts";
import { emptyEmailRequest } from "../../types/EmailRequestType.ts";
import prepareForRequest from "../../utils/prepareForRequest.ts";
import handleSubmit from "../../utils/handleSubmit.ts";
import TextInput from "../inputs/TextInput.tsx";
import setValue from "../../utils/setValue.ts";
import RangeInput from "../inputs/RangeInput.tsx";
import AImodelChoice from "../buttons/AImodel.tsx";
import DeleteAndSubmitButtonContainer from "../buttons/DeleteAndSubmitButtonContainer.tsx";
import resetEmailResponseObject from "../../utils/resetEmailResponseObject.ts";
import {useEffect} from "react";


interface EmailFormProps extends BaseFormProps{
    setEmailResponse: React.Dispatch<React.SetStateAction<EmailResponseType>>;
    emailRequest: EmailRequestType;
    setEmailRequest: React.Dispatch<React.SetStateAction<EmailRequestType>>;
}

export default function EmailForm({setEmailResponse, setGenerationTime,generationTimeInterval, setIsTextEdited, setLoadingState, errorTimeoutId,
                                      setStatus, setError, setRetryCounter, abortControllerRef, emailRequest, setEmailRequest, loadingState}: EmailFormProps) {
    const [isValid, setIsValid] = React.useState<boolean>(false);

    useEffect(() => {
        setIsValid(Boolean(emailRequest.purpose && emailRequest.recipientContext && emailRequest.tone && emailRequest.keyPoints && emailRequest.urgencyLevel)); // except CTA
    }, [emailRequest]);

    return (
        <div
            className='form-container'
            tabIndex={0}
        >
            <form
                id='email-form'
                tabIndex={0}
                autoComplete='off'
                onSubmit={(e) => {
                    e.preventDefault();
                    prepareForRequest({setGenerationTime, generationTimeInterval, setIsTextEdited, setLoadingState, errorTimeoutId, setStatus, setError, setRetryCounter});
                    resetEmailResponseObject(setEmailResponse);
                    handleSubmit({setError, setStatus, setLoadingState, abortControllerRef, request: emailRequest, setResponse: setEmailResponse, errorTimeoutId, generationTimeInterval});
                }}
            >
                <div className='fields-column fields-column-1' tabIndex={0}>
                        <TextInput
                            request={emailRequest}
                            id={'purpose'} placeholder={'purpose'}
                            setValue={(e) => setValue(e, setEmailRequest)}
                            autoFocus
                            required
                        />
                </div>

                <div className='fields-column fields-column-2' tabIndex={0}>
                    <TextInput
                        request={emailRequest}
                        id={'keyPoints'} placeholder={'key points'}
                        setValue={(e) => setValue(e, setEmailRequest)}
                        required
                    />
                </div>

                <div className='fields-column fields-column-3' tabIndex={0}>
                    <div className='double'>
                        <TextInput
                            request={emailRequest}
                            id={'recipientContext'}
                            placeholder={'recipient'}
                            setValue={(e) => setValue(e, setEmailRequest)}
                            short
                            required
                        />
                        <TextInput
                            request={emailRequest}
                            id={'tone'}
                            placeholder={'tone'}
                            setValue={(e) => setValue(e, setEmailRequest)}
                            short
                            required
                        />
                    </div>
                </div>

                <div className='fields-column fields-column-4' tabIndex={0}>
                    <div className='double'>
                        <TextInput
                            request={emailRequest}
                            id={'urgencyLevel'}
                            placeholder={'urgency'}
                            setValue={(e) => setValue(e, setEmailRequest)}
                            short
                            required
                        />
                        <TextInput
                            request={emailRequest}
                            id={'cta'}
                            placeholder={'cta'}
                            setValue={(e) => setValue(e, setEmailRequest)}
                            short
                        />
                    </div>
                </div>

                <div className='slider-column' tabIndex={0}>
                    <RangeInput
                        value={emailRequest.wordCount}
                        setValue={(e) => setValue(e, setEmailRequest)}
                        id={'wordCount'}
                        placeholder={'words'}
                        min={50}
                        max={500}
                        vertical
                    />
                </div>

                <AImodelChoice<EmailRequestType> request={emailRequest} setRequest={setEmailRequest}/>

                <DeleteAndSubmitButtonContainer loadingState={loadingState} setRequest={setEmailRequest} resetValue={emptyEmailRequest} isValid={isValid} />
            </form>
        </div>
    )
}