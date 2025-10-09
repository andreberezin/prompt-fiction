import '../styles/output.scss'
import * as React from "react";
import type OutputType from "../types/output.ts"

interface OutputProps {
    output: OutputType;
    setOutput: React.Dispatch<React.SetStateAction<OutputType>>;
}

export default function Output({output, setOutput}: OutputProps) {

    return (
        <div
            className='output'
        >

            <textarea
                id='output-text'
                value={output.content}
                onChange={(e) =>
                    setOutput({...output, content: e.target.value })
                }
            >
            </textarea>

        </div>
    )
}