import BlogForm from "../form-input/BlogForm.tsx";
import BlogOutput from "../form-output/BlogOutput.tsx";
import updateResponseObject from "../../utils/updateResponseObject.ts";
import {useEffect, useRef, useState} from "react";
import type BlogResponseType from "../../types/BlogResponse.ts";
import {useSocket} from "../context/useSocket.tsx";
import type {IMessage, StompSubscription} from "@stomp/stompjs";
import type BlogRequestType from "../../types/BlogRequest.ts";
import '../../styles/blog.scss'

export default function Blog() {
    const {stompClient, isConnected} = useSocket();

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
        contentType: 'blog',
        topic: 'How to cook pasta',
        targetAudience: 'anyone',
        tone: 'engaging',
        expertiseLevel: 'beginner',
        wordCount: 300,
        seoFocus: true,
    })
    const [blogResponse, setBlogResponse] = useState<BlogResponseType>({
        title: '',
        sections: [],
        metadata: {
            wordCount: 0,
            estimatedReadTime: '0 min',
            seoKeywords: [],
        },
        exportFormats: {
            markdown: '',
            plainText: '',
            pdfReady: false,
        },
        content: '',
        attempts: 0,
    });
    const blogResponseRef = useRef(blogResponse);

    // handle the necessary socket connection subscriptions
    useEffect(() => {
        if (!stompClient.current || !isConnected) return;

        const subs: StompSubscription[] = [];

        const blogStatusSub = stompClient.current.subscribe('/topic/blog-status', (message: IMessage) => {
            if (setStatus) setStatus(message.body ?? "");
            console.log("Status update:", message.body);
        })
        subs.push(blogStatusSub);

        const blogRetrySub = stompClient.current.subscribe('/topic/blog-retry', (message: IMessage) => {
            if (setRetryCounter) {setRetryCounter((prev: number) => prev + 1)}
            console.log(message.body);
        })
        subs.push(blogRetrySub);

        const blogUpdatedSub = stompClient.current.subscribe('/topic/blog-updated', (message: IMessage) => {
            console.log("Data updated:", message.body);
            const data = JSON.parse(message.body);
            if (setBlogResponse) {
                setBlogResponse(prev => ({
                    ...prev, // keep everything from local state
                    ...data,
                    exportFormats: {
                        ...prev.exportFormats,
                        plainText: data.exportFormats.plainText,
                        pdfReady: data.exportFormats.pdfReady,
                        // markdown untouched
                    }
                }));
            }
        })
        subs.push(blogUpdatedSub);

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
        <div id={'blog'}>
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
                        stompClient={stompClient}
                        blogResponseRef={blogResponseRef}
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
                            type: "blog"
                        })}
            />
        </div>
    )
}