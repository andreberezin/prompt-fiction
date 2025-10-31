import {useEffect, useRef, useState} from "react";
import {useSocket} from "../context/useSocket.tsx";
import type {StompSubscription} from "@stomp/stompjs";
import '../../styles/main/App.scss'
import type EmailRequestType from "../../types/form-input/EmailRequestType.ts";
import { emptyEmailRequest } from "../../types/form-input/EmailRequestType.ts";
import type EmailResponseType from "../../types/form-output/EmailResponseType.ts";
import { emptyEmailResponse } from "../../types/form-output/EmailResponseType.ts";
import EmailForm from "../form-input/EmailForm.tsx";
import EmailOutput from "../form-output/EmailOutput.tsx";
import updateResponseObject from "../../utils/api/updateResponseObject.ts";
import type {ContentType} from "../../types/form-input/ContentType.ts";

interface EmailProps {
    contentType: ContentType;
}

export default function Email({contentType}: EmailProps) {
    const {stompClient, socketHandler, isConnected} = useSocket();

    const errorTimeoutId = useRef<number>(0);
    const abortControllerRef = useRef<AbortController>(new AbortController());
    const generationTimeInterval = useRef<number>(0);

    const [status, setStatus] = useState<string>("");
    const [retryCounter, setRetryCounter] = useState<number>(0);
    const [loadingState, setLoadingState] = useState<boolean>(false);
    const [isTextEdited, setIsTextEdited] = useState<boolean>(false);
    const [generationTime, setGenerationTime] = useState<number>(0);
    const [showForm, setShowForm] = useState(true);
    const [showSEO, setShowSEO] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const [emailRequest, setEmailRequest] = useState<EmailRequestType>(emptyEmailRequest)
    const [emailResponse, setEmailResponse] = useState<EmailResponseType>(emptyEmailResponse);
    const emailResponseRef = useRef(emailResponse);

    // handle the necessary socket connection subscriptions
    useEffect(() => {
        if (!stompClient.current || !isConnected) return;

        const subs: StompSubscription[] = [];

        const emailStatusSub = socketHandler.current.subscribeToStatusUpdates(contentType, setStatus);
        if (emailStatusSub) subs.push(emailStatusSub);

        const emailRetrySub = socketHandler.current.subscribeToRetry(contentType, setRetryCounter);
        if (emailRetrySub) subs.push(emailRetrySub);

        const emailUpdatedSub = socketHandler.current.subscribeToAutoUpdate(contentType, setEmailResponse);
        if (emailUpdatedSub) subs.push(emailUpdatedSub);

        return () => {
            subs.forEach((sub) => sub.unsubscribe());
        }

    }, [isConnected]);

    useEffect(() => {
        setRetryCounter(0);
        setStatus("")
    }, [])

    useEffect(() => {
        emailResponseRef.current = emailResponse;
    }, [emailResponse]);

    return (
        <div id={contentType}>
            {showForm &&
				<EmailForm
					setEmailResponse={setEmailResponse}
                    setGenerationTime={setGenerationTime}
                    generationTimeInterval={generationTimeInterval}
                    setIsTextEdited={setIsTextEdited}
                    setLoadingState={setLoadingState}
                    errorTimeoutId={errorTimeoutId}
                    setStatus={setStatus}
                    setError={setError}
                    setRetryCounter={setRetryCounter}
                    abortControllerRef={abortControllerRef}
                    emailRequest={emailRequest}
                    setEmailRequest={setEmailRequest}
                    loadingState={loadingState}
				/>
            }

            <EmailOutput response={emailResponse}
                        setResponse={setEmailResponse}
                        loadingState={loadingState}
                        error={error}
                        setError={setError}
                        setShowForm={setShowForm}
                        showForm={showForm}
                        generationTime={generationTime}
                        isTextEdited={isTextEdited}
                        setIsTextEdited={setIsTextEdited}
                        showSEO={showSEO}
                        setShowSEO={setShowSEO}
                        retryCounter={retryCounter}
                        status={status}
                        responseRef={emailResponseRef}
                         contentType={contentType}
                        updateResponseObject={() => updateResponseObject({
                            setGenerationTime,
                            generationTimeInterval,
                            setIsTextEdited,
                            setLoadingState,
                            errorTimeoutId,
                            responseRef: emailResponseRef,
                            abortControllerRef,
                            setResponse: setEmailResponse,
                            setStatus,
                            setError,
                            type: contentType,
                        })}
            />
        </div>
    )
}