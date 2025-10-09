import '../styles/output.scss'
import * as React from "react";
import type OutputType from "../types/output.ts"

interface OutputProps {
    output: OutputType;
    setOutput: React.Dispatch<React.SetStateAction<OutputType>>;
    loadingState: boolean;
}

export default function Output({output, setOutput, loadingState}: OutputProps) {

    return (
        <div
            className={`output`}
        >

            <textarea
                id='output-text'
                className={`${loadingState ? "loading" : ""}`}
                value={output.content}
                onChange={(e) =>
                    setOutput({...output, content: e.target.value })
                }
            >
            </textarea>

        </div>
    )
}