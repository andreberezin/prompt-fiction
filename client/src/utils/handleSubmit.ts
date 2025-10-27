import axios from "axios";
import newAbortSignal from "./newAbortSignal.ts";
import handleError from "./handleError.ts";
import cleanupAfterApiRequest from "./cleanupAfterApiRequest.ts";
import * as React from "react";
import type BlogRequestType from "../types/BlogRequest.ts";
import type BlogResponseType from "../types/BlogResponse.ts";

interface handleSubmitProps {
    abortControllerRef: React.RefObject<AbortController | null>;
    request: BlogRequestType;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
    setError: React.Dispatch<React.SetStateAction<string>>;
    setResponse: React.Dispatch<React.SetStateAction<BlogResponseType>>;
    errorTimeoutId: React.RefObject<number | null>;
    generationTimeInterval: React.RefObject<number>;
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>;

}

export default async function handleSubmit ({setError, setStatus, abortControllerRef, request, setResponse, errorTimeoutId, generationTimeInterval, setLoadingState}: handleSubmitProps): Promise<void> {
    const payload = { ...request, aimodel: request.aimodel.model};
    try {
        const response = await axios.post('/api/blog/generate', payload, {
            headers: {'Content-Type': 'application/json'},
            signal: newAbortSignal(120 * 1000, abortControllerRef)
        });
        if (setResponse) setResponse(response.data || "");
        console.log("Response:", response);
        if (setStatus) setStatus("")
    } catch (err: unknown) {
        if (setError) handleError(err, setError, errorTimeoutId);
    } finally {
        cleanupAfterApiRequest(generationTimeInterval, abortControllerRef, setLoadingState);
    }
}