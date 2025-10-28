import SockJS from 'sockjs-client'
import {Client} from "@stomp/stompjs";
import * as React from "react";

export default class SocketHandler {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    #client: Client;

    constructor() {}

    set client(client: Client) {
        this.#client = client;
    }

    createSocketConnection(setIsConnected: React.Dispatch<React.SetStateAction<boolean>>) {

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

}