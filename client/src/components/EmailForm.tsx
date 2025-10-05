import '../styles/form.scss'
import Output from "./Output.tsx";

export default function EmailForm({}) {

    return (
        <div
            id={'email'}
            className={'container'}
        >
            <form id={'email-form'}>
                Input: purpose, recipient context, key points, tone
                Output: subject line, email body
                Parameters: tone, urgency level, CTA
            </form>
            <Output/>
        </div>
    )
}