import axios from "axios";
import * as React from "react";

export default function handleError(
    err: unknown,
    setError: React.Dispatch<React.SetStateAction<string>>,
    errorTimeoutId: React.RefObject<number | null>): void{
    if (axios.isCancel(err)) {
        const reason = (err.config?.signal as AbortSignal & { reason?: unknown })?.reason;

        if (reason === "manual") {
            setError("");
        } else if (reason === "timeout") {
            setError("Request timed out. Please try again.");
        } else {
            setError("Request was canceled.");
        }

    } else if (axios.isAxiosError(err)) {
        // err.response might be undefined
        if (err.response && err.response.data) {
            const { error, message, status } = err.response.data;
            console.error(`Error: ${error}\n${message}`);
            setError(`(${status}) ${message}`);
        } else {
            // fallback if no response data
            console.error("Axios error without response data:", err.message);
            setError(err.message);
        }

    } else {
        console.error("Unexpected error:", err);
        setError(String(err));
    }

    errorTimeoutId.current = setTimeout(() => {
        setError("")
    }, 10000)
}