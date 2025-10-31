import '../../styles/form-input/form.scss'
import * as React from "react";
import type BlogResponseType from "../../types/form-output/BlogResponseType.ts";
import AImodelChoice from "../buttons/AImodel.tsx";
import DeleteAndSubmitButtonContainer from "../buttons/DeleteAndSubmitButtonContainer.tsx";
import TextInput from "../inputs/TextInput.tsx";
import RangeInput from "../inputs/RangeInput.tsx";
import CheckBoxInput from "../inputs/CheckBoxInput.tsx";
import setValue from "../../utils/form-input/setValue.ts";
import prepareForRequest from "../../utils/api/prepareForRequest.ts";
import handleSubmit from "../../utils/api/handleSubmit.ts";
import type BlogRequestType from "../../types/form-input/BlogRequestType.ts";
import { emptyBlogRequest } from "../../types/form-input/BlogRequestType.ts";
import type {BaseFormProps} from "../../types/props/BaseFormProps.ts";
import resetBlogResponseObject from "../../utils/form-input/resetBlogResponseObject.ts";
import {useEffect} from "react";

interface BlogFormProps extends BaseFormProps{
    setBlogResponse: React.Dispatch<React.SetStateAction<BlogResponseType>>;
    blogRequest: BlogRequestType;
    setBlogRequest: React.Dispatch<React.SetStateAction<BlogRequestType>>;
}

export default function BlogForm({setBlogResponse, setGenerationTime,generationTimeInterval, setIsTextEdited, setLoadingState, errorTimeoutId,
                      setStatus, setError, setRetryCounter, abortControllerRef, blogRequest, setBlogRequest, loadingState}: BlogFormProps) {

    const [isValid, setIsValid] = React.useState<boolean>(false);

    useEffect(() => {
        setIsValid(Boolean(blogRequest.expertiseLevel && blogRequest.targetAudience && blogRequest.tone && blogRequest.topic));
    }, [blogRequest]);

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
                        resetBlogResponseObject(setBlogResponse);
                        handleSubmit({setError, setStatus, setLoadingState, abortControllerRef, request: blogRequest, setResponse: setBlogResponse,
                            errorTimeoutId, generationTimeInterval, contentType: "blog"});
                    }}
				>
					<div className='fields-column fields-column-1' tabIndex={0}>
                        <TextInput
                            request={blogRequest}
                            id={'topic'} placeholder={'topic'}
                            setValue={(e) => setValue(e, setBlogRequest)}
                            autoFocus
                            required
                        />
					</div>

					<div className='fields-column fields-column-2' tabIndex={0}>
                        <TextInput
                            request={blogRequest}
                            id={'targetAudience'}
                            placeholder={'audience'}
                            setValue={(e) => setValue(e, setBlogRequest)}
                            required
                        />
					</div>

					<div className='fields-column fields-column-3' tabIndex={0}>
						<div className='double'>
							<TextInput
                                request={blogRequest}
                                id={'expertiseLevel'}
                                placeholder={'expertise'}
                                setValue={(e) => setValue(e, setBlogRequest)}
                                required
                                short
                            />
                            <TextInput
                                request={blogRequest}
                                id={'tone'}
                                placeholder={'tone'}
                                setValue={(e) => setValue(e, setBlogRequest)}
                                required
                                short
                            />
						</div>
					</div>

                    <div className='fields-column fields-column-4 narrow' tabIndex={0}>
                            <CheckBoxInput
                                value={blogRequest.seoFocus}
                                setValue={(e) => setValue(e, setBlogRequest)}
                                id={'seoFocus'}
                                text={'Seo Focus'}
                            />
                    </div>

					<div className='slider-column' tabIndex={0}>
						<RangeInput
                            value={blogRequest.wordCount}
                            setValue={(e) => setValue(e, setBlogRequest)}
                            id={'wordCount'}
                            placeholder={`words`}
                            vertical
                        />
					</div>

					<AImodelChoice<BlogRequestType> request={blogRequest} setRequest={setBlogRequest}/>

					<DeleteAndSubmitButtonContainer loadingState={loadingState} setRequest={setBlogRequest} resetValue={emptyBlogRequest} isValid={isValid} />
				</form>
        </div>
    )
}