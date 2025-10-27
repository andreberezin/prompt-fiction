import * as React from "react";

export default function cleanupAfterApiRequest(
    generationTimeInterval: React.RefObject<number>,
    abortControllerRef: React.RefObject<AbortController | null>,
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>): void
{
    clearInterval(generationTimeInterval.current);
    abortControllerRef.current = null;
    setLoadingState(false);
}