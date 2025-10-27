import '../../styles/form.scss'
import Output from "../form-output/Output.tsx";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import type BlogRequestType from "../../types/BlogRequest.ts";
import type BlogResponseType from "../../types/BlogResponse.ts";
import AImodelChoice from "../buttons/AImodel.tsx";
import type {Client} from "@stomp/stompjs";
import DeleteAndSubmitButtonContainer from "../buttons/DeleteAndSubmitButtonContainer.tsx";
import TextInput from "../inputs/TextInput.tsx";
import RangeInput from "../inputs/RangeInput.tsx";
import CheckBoxInput from "../inputs/CheckBoxInput.tsx";
import setValue from "../../utils/setValue.ts";
import prepareForRequest from "../../utils/prepareForRequest.ts";
import resetResponseObject from "../../utils/resetResponseObject.ts";
import handleSubmit from "../../utils/handleSubmit.ts";
import updateResponseObject from "../../utils/updateResponseObject.ts";

interface BlogFormProps {
    blogResponse: BlogResponseType;
    setBlogResponse: React.Dispatch<React.SetStateAction<BlogResponseType>>;
    retryCounter: number;
    setRetryCounter: React.Dispatch<React.SetStateAction<number>>;
    status: string;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
    stompClient: React.RefObject<Client | null | undefined>;
}

export default function BlogForm({blogResponse, setBlogResponse, retryCounter, setRetryCounter, status, setStatus, stompClient}: BlogFormProps) {
    const errorTimeoutId = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController>(null);
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
                        e.preventDefault();
                        prepareForRequest({setGenerationTime, generationTimeInterval, setIsTextEdited, setLoadingState, errorTimeoutId, setStatus, setError, setRetryCounter});
                        resetResponseObject("blog", setBlogResponse);
                        handleSubmit({setError, setStatus, setLoadingState, abortControllerRef, request: blogRequest, setResponse: setBlogResponse, errorTimeoutId, generationTimeInterval});
                    }}
				>
					<div className='fields-column fields-column-1' tabIndex={0}>
                        <TextInput
                            request={blogRequest}
                            setRequest={setBlogRequest}
                            id={'topic'} placeholder={'topic'}
                            setValue={(e) => setValue(e, setBlogRequest)}
                            autoFocus
                        />
					</div>

					<div className='fields-column fields-column-2' tabIndex={0}>
						<div className='double'>
							<TextInput
                                request={blogRequest}
                                setRequest={setBlogRequest}
                                id={'targetAudience'}
                                placeholder={'audience'}
                                setValue={(e) => setValue(e, setBlogRequest)}
                                short
                            />
							<TextInput
                                request={blogRequest}
                                setRequest={setBlogRequest}
                                id={'tone'}
                                placeholder={'tone'}
                                setValue={(e) => setValue(e, setBlogRequest)}
                                short
                            />
						</div>
					</div>

					<div className='fields-column fields-column-3' tabIndex={0}>
						<div className='double'>
							<TextInput
                                request={blogRequest}
                                setRequest={setBlogRequest}
                                id={'expertiseLevel'}
                                placeholder={'expertise'}
                                setValue={(e) => setValue(e, setBlogRequest)}
                                short
                            />
                            <CheckBoxInput
                                value={blogRequest.seoFocus}
                                setValue={(e) => setValue(e, setBlogRequest)}
                                id={'seoFocus'}
                                text={'Seo Focus'}
                            />
						</div>
					</div>

					<div className='slider-column' tabIndex={0}>
						<RangeInput
                            value={blogRequest.wordCount}
                            setValue={(e) => setValue(e, setBlogRequest)}
                            id={'wordCount'}
                            placeholder={'words'}
                            vertical
                        />
					</div>

					<AImodelChoice blogRequest={blogRequest} setBlogRequest={setBlogRequest}/>

					<DeleteAndSubmitButtonContainer loadingState={loadingState} request={blogRequest} setRequest={setBlogRequest} />
				</form>
            }

            <Output blogResponse={blogResponse} setBlogResponse={setBlogResponse} loadingState={loadingState} error={error} showForm={showForm} setShowForm={setShowForm}
                    generationTime={generationTime} setError={setError} isTextEdited={isTextEdited} setIsTextEdited={setIsTextEdited}
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
                    showSEO={showSEO} setShowSEO={setShowSEO} retryCounter={retryCounter} status={status} stompClient={stompClient} blogResponseRef={blogResponseRef}/>
        </div>
    )
}