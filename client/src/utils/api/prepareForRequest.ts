import * as React from "react";
import handleGenerationTimer from "../form-output/handleGenerationTimer.ts";

export interface PrepareForRequestProps {
    setGenerationTime: React.Dispatch<React.SetStateAction<number>>;
    generationTimeInterval: React.RefObject<number>;
    setIsTextEdited: React.Dispatch<React.SetStateAction<boolean>>;
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>;
    errorTimeoutId: React.RefObject<number | null>;
    setStatus?: React.Dispatch<React.SetStateAction<string>>;
    setError?: React.Dispatch<React.SetStateAction<string>>;
    setRetryCounter?: React.Dispatch<React.SetStateAction<number>>;
}

export default function prepareForRequest({setGenerationTime, generationTimeInterval, setIsTextEdited, setLoadingState, errorTimeoutId, setStatus, setError, setRetryCounter}: PrepareForRequestProps): void {
    setLoadingState(true);
    setIsTextEdited(false);

    if (setRetryCounter) setRetryCounter(0);
    if (setStatus) setStatus("")
    if (setError) setError("")

    handleGenerationTimer(setGenerationTime, generationTimeInterval, 10);

    if (errorTimeoutId.current) clearTimeout(errorTimeoutId.current);
}