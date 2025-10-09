import '../styles/output.scss'
import * as React from "react";

interface OutputProps {
    output: string;
    setOutput: React.Dispatch<React.SetStateAction<string>>;
}

export default function Output({output, setOutput}: OutputProps) {

    return (
        <div
            className='output'
        >

            <textarea
                id='output-text'
                value={output}
                onChange={(e) => {setOutput(e.target.value)}}
            >
            </textarea>

        </div>
    )
}