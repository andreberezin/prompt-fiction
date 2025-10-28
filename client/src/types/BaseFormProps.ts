import * as React from "react";

export interface BaseFormProps {
    //setBlogResponse: React.Dispatch<React.SetStateAction<BlogResponseType>>;

    setGenerationTime: React.Dispatch<React.SetStateAction<number>>;
    generationTimeInterval: React.RefObject<number>;

    setIsTextEdited: React.Dispatch<React.SetStateAction<boolean>>;
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>;

    errorTimeoutId: React.RefObject<number | null>;

    setStatus: React.Dispatch<React.SetStateAction<string>>;
    setError: React.Dispatch<React.SetStateAction<string>>;
    setRetryCounter: React.Dispatch<React.SetStateAction<number>>;

    abortControllerRef: React.RefObject<AbortController>;

    //blogRequest: BlogRequestType;
    //setBlogRequest: React.Dispatch<React.SetStateAction<BlogRequestType>>;

    loadingState: boolean;
}