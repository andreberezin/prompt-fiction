import '../styles/output.scss'
import * as React from "react";
import type OutputType from "../types/output.ts"

interface OutputProps {
    output: OutputType;
    setOutput: React.Dispatch<React.SetStateAction<OutputType>>;
    loadingState: boolean;
    error: string;
}

export default function Output({output, setOutput, loadingState, error}: OutputProps) {



    return (
        <div
            className={`output`}
        >

            <textarea
                id='output-text'
                className={`${error ? "error" : (loadingState ? "loading" : "")}`}
                value={error !== "" ? error : output.content || ""}
                readOnly={error !== ""}
                onChange={(e) =>
                    setOutput({...output, content: e.target.value })
                }
            >
            </textarea>

        </div>
    )
}