import SockJS from 'sockjs-client'
import {Client, type IMessage} from "@stomp/stompjs";
import * as React from "react";
import type BlogResponseType from "../types/BlogResponse.ts";

// interface socketProps {
//     setRetryCounter: React.Dispatch<React.SetStateAction<number>>;
//     setStatus: React.Dispatch<React.SetStateAction<string>>;
// }

export default class SocketHandler {
    // eslint-disable-next-line
    // @ts-ignore
    #client: Client;

    constructor() {}

    setClient(client: Client) {
        this.#client = client;
    }

    createSocketConnection(
        setRetryCounter?: React.Dispatch<React.SetStateAction<number>>,
        setStatus?: React.Dispatch<React.SetStateAction<string>>,
        setBlogResponse?: React.Dispatch<React.SetStateAction<BlogResponseType>>
    ) {
        if (this.#client) {
            console.log("Socket connection already connected");
            return;
        }
        const socket = new SockJS('ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            // connectHeaders: {
            //
            // },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Socket Connected");

                stompClient.subscribe('/topic/blog-status', (message: IMessage) => {
                    //setStatus(message.body);
                    // setTimeout(() => {
                    //     setStatus("")
                    // }, 3000)
                    //const data = JSON.parse(message.body);
                    if (setStatus) setStatus(message.body ?? "");
                    console.log("Status update:", message.body);
                })

                stompClient.subscribe('/topic/blog-retry', (message: IMessage) => {
                    //setRetryCounter((prev: number) => prev + 1);
                    //const data = JSON.parse(message.body);
                    if (setRetryCounter) {setRetryCounter((prev: number) => prev + 1)}
                    console.log(message.body);
                })

                stompClient.subscribe('/topic/blog-updated', (message: IMessage) => {
                    const data = JSON.parse(message.body);
                    if (setBlogResponse) {
                        setBlogResponse(prev => ({
                            ...prev, // keep everything from local state
                            ...data,
                            exportFormats: {
                                ...prev.exportFormats,
                                plainText: data.exportFormats.plainText,
                                pdfReady: data.exportFormats.pdfReady,
                                // markdown untouched
                            }
                        }));
                    }
                })

                // stompClient.subscribe('/email', (data) => {
                //     // callback
                //     console.log(data);
                // })
            },
            onStompError: (frame) => {
                console.error("Broker reported error: ", frame);
            },
            onDisconnect: () => {
                console.log("Socket disconnected");
            }
        })

        this.setClient(stompClient);

        stompClient.activate();
        return stompClient;
    }

}