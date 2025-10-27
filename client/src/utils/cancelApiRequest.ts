import * as React from "react";
import cleanupAfterApiRequest from "./cleanupAfterApiRequest.ts";

export default function cancelApiRequest (
    abortControllerRef: React.RefObject<AbortController | null>,
    setShowSEO: React.Dispatch<React.SetStateAction<boolean>>,
    errorTimeoutId: React.RefObject<number>,
    generationTimeInterval: React.RefObject<number>,
    setGenerationTime: React.Dispatch<React.SetStateAction<number>>,
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>,
): void{
    if (abortControllerRef.current) {
        abortControllerRef.current?.abort("manual");
        // abortControllerRef.current.abort();
    }
    setShowSEO(false);
    if (errorTimeoutId.current) clearTimeout(errorTimeoutId.current);
    if (generationTimeInterval.current) clearInterval(generationTimeInterval.current);
    setGenerationTime(0)

    cleanupAfterApiRequest(generationTimeInterval, abortControllerRef, setLoadingState);
}