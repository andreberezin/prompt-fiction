import '../styles/form.scss'
import Output from "./Output.tsx";
import SubmitButton from "./SubmitButton.tsx";
import ClearButton from "./ClearButton.tsx";
import * as React from "react";
import axios from 'axios';
import {useState} from "react";
import type BlogFormData from "../types/blogFormData.ts";
import type OutputType from "../types/output.ts";
import AImodel from "./AImodel.tsx";

export default function BlogForm() {
    const [loadingState, setLoadingState] = useState<boolean>(false);
    const [blogFormData, setBlogFormData] = useState<BlogFormData>({
        aimodel: {
            model: 'gemini-2.5-flash-lite',
            tooltip: 'ultra fast'
        },
        contentType: 'blog',
        topic: 'How to cook pasta',
        targetAudience: 'anyone',
        tone: 'engaging',
        expertiseLevel: 'beginner',
        wordCount: 50,
        seoFocus: true,
    })
    const [output, setOutput] = useState<OutputType>({
        title: '',
        content: '',
        wordCount: 0,
        keywords: [],
    });

    const togglePlaceholder = (value: string, labelId: string ) => {
        const labelElement = document.getElementById(labelId);
        if (value && labelElement) {labelElement.classList.add('filled');}
        if (!value && labelElement) {labelElement.classList.remove('filled');}
    }

    const showPlaceholder = (labelId: string) => {
        const labelElement = document.getElementById(labelId);
        if (labelElement) {
            labelElement.classList.add('filled');
        }
    }

    const hideplaceholder = (value: string, labelId: string) => {
        const labelElement = document.getElementById(labelId);
        if (labelElement && !value) {
            labelElement.classList.remove('filled');
        }
    }

    const setData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setBlogFormData((current) => ({
            ...current,
            [e.target.name]: value,
        }));
    }

    const handleSubmit = async (e:  React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoadingState(true);
        const payload = { ...blogFormData, aimodel: blogFormData.aimodel.model};
        const response = await axios.post('/api/blog', payload);
        console.log("Got response: ", response);
        setLoadingState(false);
        setOutput(response.data);
    }

    return (
        <div
            id='blog'
            className='container'
        >

            <form
                id='blog-form'
                autoComplete='off'
                onSubmit={(e) => {
                    handleSubmit(e);
            }}
            >

                <div className='fields-column fields-column-1'>

                    <label
                        id='topic'
                        className='long placeholder'
                        data-placeholder='topic'
                        onMouseEnter={(e) => showPlaceholder(e.currentTarget.id)}
                        onMouseLeave={(e) => hideplaceholder(blogFormData.topic, e.currentTarget.id)}
                    >
                        <input
                            autoFocus={true}
                            type='text'
                            name='topic'
                            maxLength={100}
                            placeholder='topic'
                            value={blogFormData.topic}
                            onChange={(e) => {
                                togglePlaceholder(e.target.value, e.target.name);
                                setData(e);
                            }}
                            onFocus={(e) => showPlaceholder(e.target.name)}
                            onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                        />
                    </label>

                </div>
                <div className='fields-column fields-column-2'>
                    <div
                        className='double'
                    >
                        <label
                            id='targetAudience'
                            className='short placeholder'
                            data-placeholder='audience'
                            onMouseEnter={(e) => showPlaceholder(e.currentTarget.id)}
                            onMouseLeave={(e) => hideplaceholder(blogFormData.targetAudience, e.currentTarget.id)}
                        >
                            <input
                                type='text'
                                name='targetAudience'
                                maxLength={50}
                                placeholder='target audience'
                                value={blogFormData.targetAudience}
                                onChange={(e) => {
                                    togglePlaceholder(e.target.value, e.target.name);
                                    setData(e);
                                }}
                                onFocus={(e) => showPlaceholder(e.target.name)}
                                onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                            />
                        </label>

                        {/*todo might switch to a <select> dropdown menu later*/}
                        <label
                            id='tone'
                            className='short placeholder'
                            data-placeholder='tone'
                            onMouseEnter={(e) => showPlaceholder(e.currentTarget.id)}
                            onMouseLeave={(e) => hideplaceholder(blogFormData.tone, e.currentTarget.id)}
                        >
                            <input
                                className='filled'
                                type='text'
                                name='tone'
                                maxLength={20}
                                placeholder='tone'
                                value={blogFormData.tone}
                                onChange={(e) => {
                                    togglePlaceholder(e.target.value, e.target.name);
                                    setData(e);
                                }}
                                onFocus={(e) => showPlaceholder(e.target.name)}
                                onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                            />
                        </label>
                </div>

                </div>

                <div className='fields-column fields-column-3'>
                    <div className='double'>

                        {/*todo might switch to a <select> dropdown menu later*/}
                        <label
                            id='expertiseLevel'
                            className='short placeholder'
                            data-placeholder='expertise'
                            onMouseEnter={(e) => showPlaceholder(e.currentTarget.id)}
                            onMouseLeave={(e) => hideplaceholder(blogFormData.expertiseLevel, e.currentTarget.id)}
                        >
                            <input
                                type='text'
                                name='expertiseLevel'
                                placeholder='expertise level'
                                maxLength={50}
                                value={blogFormData.expertiseLevel}
                                onChange={(e) => {
                                    togglePlaceholder(e.target.value, e.target.name);
                                    setData(e);
                                }}
                                onFocus={(e) => showPlaceholder(e.target.name)}
                                onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                            />
                        </label>

                        <label
                            id='seoFocus'
                            className='short'
                            // data-placeholder='seo'
                        >
                            Seo Focus
                            <input
                                type='checkbox'
                                name='seoFocus'
                                checked={blogFormData.seoFocus}
                                onChange={(e) => {
                                    setData(e);
                                }}
                            />
                        </label>
                    </div>
                </div>

                <div className='slider-column'>
                    <label
                        id='wordCount'
                        className='long placeholder'
                        data-placeholder='words'
                    >
                        {blogFormData.wordCount}
                        <input
                            type='range'
                            name='wordCount'
                            placeholder='word count'
                            min={10}
                            max={2000}
                            step={10}
                            value={blogFormData.wordCount}
                            onChange={(e) => {
                                togglePlaceholder(e.target.value, e.target.name);
                                setData(e);
                            }}
                            onFocus={(e) => showPlaceholder(e.target.name)}
                            onBlur={(e) => hideplaceholder(e.target.value, e.target.name)}
                        />
                    </label>
                </div>

                <AImodel blogFormData={blogFormData} setBlogFormData={setBlogFormData}/>

                <div className='button-container'>
                    <SubmitButton loadingState={loadingState}/>
                    <ClearButton setBlogFormData={setBlogFormData}/>
                </div>
            </form>
            <Output output={output} setOutput={setOutput} loadingState={loadingState}/>
        </div>
    )
}