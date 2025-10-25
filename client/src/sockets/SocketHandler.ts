import SockJS from 'sockjs-client'
import {Client, type IMessage} from "@stomp/stompjs";
import * as React from "react";

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
        onRetryUpdate?: React.Dispatch<React.SetStateAction<number>>,
        onStatusUpdate?: React.Dispatch<React.SetStateAction<string>>
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
                    if (onStatusUpdate) onStatusUpdate(message.body ?? "");
                    console.log("Status update:", message.body);
                })

                stompClient.subscribe('/topic/blog-retry', (message: IMessage) => {
                    //setRetryCounter((prev: number) => prev + 1);
                    //const data = JSON.parse(message.body);
                    if (onRetryUpdate) {onRetryUpdate((prev: number) => prev + 1)}
                    console.log(message.body);
                })

                // stompClient.subscribe('/email', (data) => {
                //     // callback
                //     console.log(data);
                // })
            }
        })

        this.setClient(stompClient);

        stompClient.activate();
        return stompClient;
    }

}