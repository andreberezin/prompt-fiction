import '../styles/form.scss'
import Output from "./Output.tsx";
import * as React from "react";
import axios from 'axios';
import {useEffect, useRef, useState} from "react";
import type BlogRequestType from "../types/BlogRequest.ts";
import type BlogResponseType from "../types/BlogResponse.ts";
import AImodel from "./AImodel.tsx";
import type {Client} from "@stomp/stompjs";
import {DeleteAndSubmitButtonContainer} from "./DeleteAndSubmitButtonContainer.tsx";
import {TextInput} from "./TextInput.tsx";
import {RangeInput} from "./RangeInput.tsx";
import {CheckBoxInput} from "./CheckBoxInput.tsx";

interface BlogFormProps {
    blogResponse: BlogResponseType;
    setBlogResponse: React.Dispatch<React.SetStateAction<BlogResponseType>>;
    retryCounter: number;
    setRetryCounter: React.Dispatch<React.SetStateAction<number>>;
    status: string;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
    stompClient: React.RefObject<Client | null | undefined>;
    setIsEditingMarkdown: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BlogForm({blogResponse, setBlogResponse, retryCounter, setRetryCounter, status, setStatus, stompClient, setIsEditingMarkdown}: BlogFormProps) {
    const errorTimeoutId = useRef<number>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const generationTimeInterval = useRef<number>(0);
    const blogResponseRef = useRef(blogResponse);

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

    useEffect(() => {
        setRetryCounter(0);
        setStatus("")
    }, [])

    useEffect(() => {
        blogResponseRef.current = blogResponse;
    }, [blogResponse]);


    const setValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setBlogRequest((current) => ({
            ...current,
            [e.target.name]: value,
        }));
    }

    const handleGenerationTimer = () => {
        setGenerationTime(0);
        generationTimeInterval.current = setInterval(() => setGenerationTime(current => current + 10), 10);
    }

    const prepareForRequest = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        handleGenerationTimer();

        setIsTextEdited(false);

        if (errorTimeoutId.current) clearTimeout(errorTimeoutId.current);
        setLoadingState(true);
    }

    const cleanupAfterRequest = () => {
        clearInterval(generationTimeInterval.current);
        abortControllerRef.current = null;
        setLoadingState(false);
    }

    function newAbortSignal(timeoutMs: number) {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setTimeout(() => abortController.abort("timeout"), timeoutMs);

        return abortController.signal;
    }

    const handleError = (err: unknown) => {
        if (axios.isCancel(err)) {
            const reason = (err.config?.signal as AbortSignal & { reason?: unknown })?.reason;

            if (reason === "manual") {
                setError("");
            } else if (reason === "timeout") {
                setError("Request timed out. Please try again.");
            } else {
                setError("Request was canceled.");
            }

        } else if (axios.isAxiosError(err)) {
            // err.response might be undefined
            if (err.response && err.response.data) {
                const { error, message, status } = err.response.data;
                console.error(`Error: ${error}\n${message}`);
                setError(`(${status}) ${message}`);
            } else {
                // fallback if no response data
                console.error("Axios error without response data:", err.message);
                setError(err.message);
            }

        } else {
            console.error("Unexpected error:", err);
            setError(String(err));
        }

        errorTimeoutId.current = setTimeout(() => {
            setError("")
        }, 10000)
    }

    const handleSubmit = async (e:  React.FormEvent<HTMLFormElement>) => {
        prepareForRequest(e);
        setBlogResponse({
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
        })
        setRetryCounter(0);
        setStatus("")

        const payload = { ...blogRequest, aimodel: blogRequest.aimodel.model};
        try {
            const response = await axios.post('/api/blog/generate', payload, {
                headers: {'Content-Type': 'application/json'},
                signal: newAbortSignal(120 * 1000)
            });
            setBlogResponse(response.data || "");
            console.log("Response:", response);
            setStatus("")
        } catch (err: unknown) {
            handleError(err);
        } finally {
            cleanupAfterRequest();
        }
    }

    // todo function to update everything based on the edited markdown output
    const updateOutput = async (e: React.MouseEvent<HTMLButtonElement>) => {
        prepareForRequest(e);
        try {
            const response = await axios.post('/api/blog/update-manual', blogResponseRef.current, {
                headers: {'Content-Type': 'application/json'},
                signal: newAbortSignal(120 * 1000)
            });
            setBlogResponse(response.data || "");
            console.log("Response:", response);
            setStatus("")
        } catch (err) {
            handleError(err);
        } finally {
            cleanupAfterRequest();
        }
    }

    const cancelRequest = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current?.abort("manual");
            // abortControllerRef.current.abort();
        }
        setShowSEO(false);
        if (errorTimeoutId.current) clearTimeout(errorTimeoutId.current);
        if (generationTimeInterval.current) clearInterval(generationTimeInterval.current);
        setGenerationTime(0)

        cleanupAfterRequest();
    }

    return (
        <div
            id='blog'
            className='container'
            tabIndex={0}
        >

            {showForm &&
				<form
					id='blog-form'
					tabIndex={0}
					autoComplete='off'
					onSubmit={(e) => {
                        handleSubmit(e);
                    }}
				>
					<div className='fields-column fields-column-1' tabIndex={0}>
                        <TextInput request={blogRequest} setRequest={setBlogRequest} id={'topic'} placeholder={'topic'} setValue={setValue} autoFocus/>
					</div>

					<div className='fields-column fields-column-2' tabIndex={0}>
						<div className='double'>
							<TextInput request={blogRequest} setRequest={setBlogRequest} id={'targetAudience'} placeholder={'audience'} setValue={setValue} short/>
							<TextInput request={blogRequest} setRequest={setBlogRequest} id={'tone'} placeholder={'tone'} setValue={setValue} short/>
						</div>
					</div>

					<div className='fields-column fields-column-3' tabIndex={0}>
						<div className='double'>
							<TextInput request={blogRequest} setRequest={setBlogRequest} id={'expertiseLevel'} placeholder={'expertise'} setValue={setValue} short/>
                            <CheckBoxInput value={blogRequest.seoFocus} setValue={setValue} id={'seoFocus'} text={'Seo Focus'}/>
						</div>
					</div>

					<div className='slider-column' tabIndex={0}>
						<RangeInput value={blogRequest.wordCount} setValue={setValue} id={'wordCount'} placeholder={'words'} vertical/>
					</div>

					<AImodel blogRequest={blogRequest} setBlogRequest={setBlogRequest}/>

					<DeleteAndSubmitButtonContainer loadingState={loadingState} cancelRequest={cancelRequest} request={blogRequest} setRequest={setBlogRequest} />
				</form>
            }

            <Output blogResponse={blogResponse} setBlogResponse={setBlogResponse} loadingState={loadingState} error={error} showForm={showForm} setShowForm={setShowForm} generationTime={generationTime} setError={setError} isTextEdited={isTextEdited} setIsTextEdited={setIsTextEdited} updateOutput={updateOutput} showSEO={showSEO} setShowSEO={setShowSEO} retryCounter={retryCounter} status={status} stompClient={stompClient} setIsEditingMarkdown={setIsEditingMarkdown} blogResponseRef={blogResponseRef}/>
        </div>
    )
}