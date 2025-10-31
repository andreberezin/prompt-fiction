import prepareForRequest from "./prepareForRequest.ts";
import cleanupAfterApiRequest from "./cleanupAfterApiRequest.ts";
import handleError from "./handleError.ts";
import newAbortSignal from "./newAbortSignal.ts";
import axios from "axios";
import type {PrepareForRequestProps} from "./prepareForRequest.ts";
import * as React from "react";
import type {ContentType} from "../../types/form-input/ContentType.ts";

interface updateResponseObjectProps<T> extends PrepareForRequestProps {
    responseRef:  React.RefObject<T>;
    abortControllerRef: React.RefObject<AbortController | null>;
    setResponse: React.Dispatch<React.SetStateAction<T>>;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
    setError: React.Dispatch<React.SetStateAction<string>>;
    type: ContentType;
}

export default async function updateResponseObject<T>( {setGenerationTime, generationTimeInterval, setIsTextEdited, setLoadingState, errorTimeoutId,
        responseRef, abortControllerRef, setResponse, setStatus, setError, type
    }: updateResponseObjectProps<T>): Promise<void>  {
    prepareForRequest({setGenerationTime, generationTimeInterval, setIsTextEdited, setLoadingState, errorTimeoutId});
    try {
        const response = await axios.post(`/api/${type}/update-manual`, responseRef.current, {
            headers: {'Content-Type': 'application/json'},
            signal: newAbortSignal(120 * 1000, abortControllerRef)
        });
        setResponse(response.data || "");
        setStatus("")
    } catch (err) {
        setStatus("")
        handleError(err, setError, errorTimeoutId);
    } finally {
        cleanupAfterApiRequest(generationTimeInterval, abortControllerRef, setLoadingState);
    }
}