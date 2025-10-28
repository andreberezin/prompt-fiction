import '../../styles/form.scss'
import BlogOutput from "../form-output/BlogOutput.tsx";
import {useState} from "react";

export default function EmailForm() {
    const [output, setOutput] = useState('');

    return (
        <div
            id='email'
            className='container'
        >
            <form id='email-form'>
                Input: purpose, recipient context, key points, tone
                Output: subject line, email body
                Parameters: tone, urgency level, CTA
            </form>
            <BlogOutput output={output} setOutput={setOutput}/>
        </div>
    )
}