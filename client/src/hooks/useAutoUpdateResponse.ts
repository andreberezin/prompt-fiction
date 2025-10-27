import useDebounce from "./useDebounce.ts";
import * as React from "react";
import type {Client} from "@stomp/stompjs";
import type {ContentType} from "../types/ContentType.ts";

interface HandleAutoUpdateResponseParams<T> {
    stompClient: React.RefObject<Client>;
    responseRef: React.RefObject<T>;
    debounceDelay?: number;
    contentType: ContentType;
}

export default function useAutoUpdateResponse<T>({stompClient, responseRef, debounceDelay = 10, contentType}: HandleAutoUpdateResponseParams<T>) {
    const handleAutoUpdateResponse = useDebounce(() => {
        if (stompClient.current?.connected) {
            stompClient.current.publish({
                destination: `app/${contentType}/update-auto`,
                body: JSON.stringify(responseRef.current),
            });
        }
    }, debounceDelay);

    return handleAutoUpdateResponse;
}