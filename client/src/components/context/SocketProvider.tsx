import type {Client} from "@stomp/stompjs";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import SocketHandler from "../../sockets/SocketHandler.ts";
import {SocketContext} from "./SocketContext.tsx";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const stompClient = useRef<Client | undefined | null>(null);
    const socketHandler = useRef<SocketHandler>(new SocketHandler());
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        stompClient.current = socketHandler.current.createSocketConnection(setIsConnected);
        return () => {socketHandler.current.disconnect()};
    }, []);

    return (
        <SocketContext.Provider value={{ stompClient, socketHandler, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}