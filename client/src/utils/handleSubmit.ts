import axios from "axios";
import newAbortSignal from "./newAbortSignal.ts";
import handleError from "./handleError.ts";
import cleanupAfterApiRequest from "./cleanupAfterApiRequest.ts";
import * as React from "react";
import type {HasAImodel} from "../types/HasAImodel.ts";

interface handleSubmitProps<Req extends HasAImodel, Res> {
    abortControllerRef: React.RefObject<AbortController | null>;
    request: Req;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
    setError: React.Dispatch<React.SetStateAction<string>>;
    setResponse: React.Dispatch<React.SetStateAction<Res>>;
    errorTimeoutId: React.RefObject<number | null>;
    generationTimeInterval: React.RefObject<number>;
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>;

}

export default async function handleSubmit<Req extends HasAImodel, Res> ({setError, setStatus, abortControllerRef, request, setResponse, errorTimeoutId, generationTimeInterval, setLoadingState}: handleSubmitProps<Req, Res>): Promise<void> {
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
        if (setStatus) setStatus("")
        if (setError) handleError(err, setError, errorTimeoutId);
    } finally {
        cleanupAfterApiRequest(generationTimeInterval, abortControllerRef, setLoadingState);
    }
}