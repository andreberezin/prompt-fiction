import SockJS from 'sockjs-client'
import {Client, type IMessage, type StompSubscription} from "@stomp/stompjs";
import * as React from "react";
import type {ContentType} from "../types/ContentType.ts";

interface HasExportFormats {
    exportFormats: {
        markdown: string;
        plainText: string;
        richText: string;
        pdfReady: boolean;
    };
}

export default class SocketHandler {
    private client: Client | null = null;

    constructor() {}

    createSocketConnection(setIsConnected: React.Dispatch<React.SetStateAction<boolean>>) {

        if (this.client && this.client.active) {
            console.log("Socket connection already connected");
            return;
        }
        const socket = new SockJS('ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Socket Connected");
                setIsConnected(true);
            },
            onStompError: (frame) => {
                console.error("Broker reported error: ", frame);
            },
            onDisconnect: () => {
                console.log("Socket disconnected");
                setIsConnected(false);
            }
        })

        this.client = stompClient;

        stompClient.activate();
        return stompClient;
    }

    disconnect() {
        if (this.client && this.client.active) {
            this.client.deactivate();
            this.client = null;
        }
    }

    subscribeToStatusUpdates(
        contentType: ContentType,
        setStatus: React.Dispatch<React.SetStateAction<string>>
    ): StompSubscription | null {
        if (this.client && this.client.active) {
            return this.client.subscribe(`/topic/${contentType}-status`, (message: IMessage) => {
                const body = message.body ?? "";
                if (setStatus) setStatus(body);
                console.log("Status update:", body);
            });
        } else {
            console.warn("Socket not connected — cannot subscribe yet.");
            return null;
        }
    }

    subscribeToRetry(contentType: ContentType, setRetryCounter: React.Dispatch<React.SetStateAction<number>>): StompSubscription | null {
        if (this.client && this.client.active) {
            return this.client.subscribe(`/topic/${contentType}-retry`, (message: IMessage) => {
                if (setRetryCounter) setRetryCounter((prev: number) => prev + 1)
                console.log(message.body);
            });
        } else {
            console.warn("Socket not connected — cannot subscribe yet.");
            return null;
        }
    }

    subscribeToAutoUpdate<T extends HasExportFormats>(contentType: ContentType, setResponse: React.Dispatch<React.SetStateAction<T>>): StompSubscription | null {
        if (this.client && this.client.active) {
            return this.client.subscribe(`/topic/${contentType}-updated`, (message: IMessage) => {
                const data = JSON.parse(message.body);
                if (setResponse) {
                    setResponse(prev => ({
                        ...prev, // keep everything from local state
                        ...data,
                        exportFormats: {
                            ...prev.exportFormats,
                            plainText: data.exportFormats.plainText,
                            richText: data.exportFormats.richText,
                            pdfReady: data.exportFormats.pdfReady,
                            // markdown untouched
                        }
                    }));
                }
            })
        } else {
            console.warn("Socket not connected — cannot subscribe yet.");
            return null;
        }
    }

}