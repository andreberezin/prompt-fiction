import {useEffect, useRef, useState} from "react";
import {useSocket} from "../context/useSocket.tsx";
import type {StompSubscription} from "@stomp/stompjs";
import '../../styles/main.scss'
import type EmailRequestType from "../../types/EmailRequestType.ts";
import type EmailResponseType from "../../types/EmailResponseType.ts";
import { emptyEmailResponse } from "../../types/EmailResponseType.ts";
import EmailForm from "../form-input/EmailForm.tsx";
import EmailOutput from "../form-output/EmailOutput.tsx";
import updateResponseObject from "../../utils/updateResponseObject.ts";

export default function Email() {
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

    const [emailRequest, setEmailRequest] = useState<EmailRequestType>({
        aimodel: {
            model: 'gemini-2.5-flash-lite',
            tooltip: 'ultra fast'
        },
        contentType: 'email',
        wordCount: 100,
        purpose: 'Get the spreadsheet done this week',
        keyPoints: '',
        recipientContext: 'colleague',
        tone: 'passive-aggressive',
        urgencyLevel: 'very urgent',
        cta: '',
    })
    const [emailResponse, setEmailResponse] = useState<EmailResponseType>(emptyEmailResponse);
    const emailResponseRef = useRef(emailResponse);

    // handle the necessary socket connection subscriptions
    useEffect(() => {
        if (!stompClient.current || !isConnected) return;

        const subs: StompSubscription[] = [];

        const emailStatusSub = socketHandler.current.subscribeToStatusUpdates("email", setStatus);
        if (emailStatusSub) subs.push(emailStatusSub);

        const emailRetrySub = socketHandler.current.subscribeToRetry("email", setRetryCounter);
        if (emailRetrySub) subs.push(emailRetrySub);

        const emailUpdatedSub = socketHandler.current.subscribeToAutoUpdate("email", setEmailResponse);
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
        <div id={'email'}>
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
                            type: "blog"
                        })}
            />
        </div>
    )
}