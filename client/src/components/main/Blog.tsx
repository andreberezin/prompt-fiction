import BlogForm from "../form-input/BlogForm.tsx";
import BlogOutput from "../form-output/BlogOutput.tsx";
import updateResponseObject from "../../utils/api/updateResponseObject.ts";
import {useEffect, useRef, useState} from "react";
import type BlogResponseType from "../../types/form-output/BlogResponseType.ts";
import { emptyBLogResponse } from "../../types/form-output/BlogResponseType.ts";
import {useSocket} from "../context/useSocket.tsx";
import type {StompSubscription} from "@stomp/stompjs";
import type BlogRequestType from "../../types/BlogRequestType.ts";
import '../../styles/main/App.scss'
import type {ContentType} from "../../types/ContentType.ts";


interface BlogProps {
    contentType: ContentType;
}

export default function Blog({contentType}: BlogProps) {
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

    const [blogRequest, setBlogRequest] = useState<BlogRequestType>({
        aimodel: {
            model: 'gemini-2.5-flash-lite',
            tooltip: 'ultra fast'
        },
        contentType: contentType,
        topic: 'How to cook pasta',
        targetAudience: 'anyone',
        tone: 'engaging',
        expertiseLevel: 'beginner',
        wordCount: 400,
        seoFocus: true,
    })
    const [blogResponse, setBlogResponse] = useState<BlogResponseType>(emptyBLogResponse);
    const blogResponseRef = useRef(blogResponse);

    // handle the necessary socket connection subscriptions
    useEffect(() => {
        if (!stompClient.current || !isConnected) return;

        const subs: StompSubscription[] = [];

        const blogStatusSub = socketHandler.current.subscribeToStatusUpdates(contentType, setStatus);
        if (blogStatusSub) subs.push(blogStatusSub);

        const blogRetrySub = socketHandler.current.subscribeToRetry(contentType, setRetryCounter);
        if (blogRetrySub) subs.push(blogRetrySub);

        const blogUpdatedSub = socketHandler.current.subscribeToAutoUpdate(contentType, setBlogResponse);
        if (blogUpdatedSub) subs.push(blogUpdatedSub);

        return () => {
            subs.forEach((sub) => sub.unsubscribe());
        }

    }, [isConnected]);

    useEffect(() => {
        setRetryCounter(0);
        setStatus("")
    }, [])

    useEffect(() => {
        blogResponseRef.current = blogResponse;
    }, [blogResponse]);

    return (
        <div id={contentType}>
            {showForm &&
				<BlogForm
					setBlogResponse={setBlogResponse}
                    setGenerationTime={setGenerationTime}
                    generationTimeInterval={generationTimeInterval}
                    setIsTextEdited={setIsTextEdited}
                    setLoadingState={setLoadingState}
                    errorTimeoutId={errorTimeoutId}
                    setStatus={setStatus}
                    setError={setError}
                    setRetryCounter={setRetryCounter}
                    abortControllerRef={abortControllerRef}
                    blogRequest={blogRequest}
                    setBlogRequest={setBlogRequest}
                    loadingState={loadingState}
				/>
            }

            <BlogOutput blogResponse={blogResponse}
                        setBlogResponse={setBlogResponse}
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
                        blogResponseRef={blogResponseRef}
                        contentType={contentType}
                        updateResponseObject={() => updateResponseObject({
                            setGenerationTime,
                            generationTimeInterval,
                            setIsTextEdited,
                            setLoadingState,
                            errorTimeoutId,
                            responseRef: blogResponseRef,
                            abortControllerRef,
                            setResponse: setBlogResponse,
                            setStatus,
                            setError,
                            type: contentType
                        })}
            />
        </div>
    )
}