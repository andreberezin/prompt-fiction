import '../../styles/form.scss'
import * as React from "react";
import type BlogResponseType from "../../types/BlogResponse.ts";
import AImodelChoice from "../buttons/AImodel.tsx";
import DeleteAndSubmitButtonContainer from "../buttons/DeleteAndSubmitButtonContainer.tsx";
import TextInput from "../inputs/TextInput.tsx";
import RangeInput from "../inputs/RangeInput.tsx";
import CheckBoxInput from "../inputs/CheckBoxInput.tsx";
import setValue from "../../utils/setValue.ts";
import prepareForRequest from "../../utils/prepareForRequest.ts";
import resetResponseObject from "../../utils/resetResponseObject.ts";
import handleSubmit from "../../utils/handleSubmit.ts";
import type BlogRequestType from "../../types/BlogRequest.ts";

interface BlogFormProps {
    setBlogResponse: React.Dispatch<React.SetStateAction<BlogResponseType>>;

    setGenerationTime: React.Dispatch<React.SetStateAction<number>>;
    generationTimeInterval: React.RefObject<number>;

    setIsTextEdited: React.Dispatch<React.SetStateAction<boolean>>;
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>;

    errorTimeoutId: React.RefObject<number | null>;

    setStatus: React.Dispatch<React.SetStateAction<string>>;
    setError: React.Dispatch<React.SetStateAction<string>>;
    setRetryCounter: React.Dispatch<React.SetStateAction<number>>;

    abortControllerRef: React.RefObject<AbortController>;

    blogRequest: BlogRequestType;
    setBlogRequest: React.Dispatch<React.SetStateAction<BlogRequestType>>;

    loadingState: boolean;
}

export default function BlogForm({setBlogResponse, setGenerationTime,generationTimeInterval, setIsTextEdited, setLoadingState, errorTimeoutId,
                      setStatus, setError, setRetryCounter, abortControllerRef, blogRequest, setBlogRequest, loadingState}: BlogFormProps) {


    return (
        <div
            className='form-container'
            tabIndex={0}
        >
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
        </div>
    )
}