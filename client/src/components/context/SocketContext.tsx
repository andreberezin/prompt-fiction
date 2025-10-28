import type {Client} from "@stomp/stompjs";
import * as React from "react";
import SocketHandler from "../../sockets/SocketHandler.ts";

interface SocketContextValue {
    stompClient: React.RefObject<Client | undefined | null>;
    socketHandler: React.RefObject<SocketHandler>;
    isConnected: boolean;
}

export const SocketContext = React.createContext<SocketContextValue | undefined>(undefined);