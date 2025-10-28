import type {Client} from "@stomp/stompjs";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import SocketHandler from "../../sockets/SocketHandler.ts";

interface SocketContextValue {
    stompClient: React.RefObject<Client | null>;
    isConnected: boolean;
}

const SocketContext = React.createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const stompClient = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketHandler = new SocketHandler();
        stompClient.current = socketHandler.createSocketConnection(
            setIsConnected,
        ) as Client;

        return () => {stompClient.current?.deactivate()};
    }, []);

    return (
        <SocketContext.Provider value={{ stompClient, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketContext;