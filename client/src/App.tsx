import './styles/App.scss'
import NavBar from "./components/NavBar.tsx";
import {useEffect, useRef, useState} from "react";
import type {ContentType} from "./types/content.ts";
import BlogForm from "./components/BlogForm.tsx";
import EmailForm from "./components/EmailForm.tsx";
import SocketHandler from "./sockets/SocketHandler.ts";
import type {Client} from "@stomp/stompjs";

function App() {
    const [contentType, setContentType] = useState<ContentType>('blog');
    const [retryCounter, setRetryCounter] = useState<number>(0);
    const [status, setStatus] = useState<string>("");
    const stompClientRef = useRef<Client | null | undefined>(null);

    // establish a websocket connection
    useEffect(() => {
        const socketHandler = new SocketHandler();
        stompClientRef.current = socketHandler.createSocketConnection(setRetryCounter, setStatus);
        return () => {stompClientRef.current?.deactivate()}
    }, [])


  return (
    <div id={'ghostwriter'}>
        <NavBar contentType={contentType} setContentType={setContentType}/>
        {contentType === 'blog' && <BlogForm retryCounter={retryCounter} setRetryCounter={setRetryCounter} status={status} setStatus={setStatus}/> }
        {contentType === 'email' && <EmailForm/> }
    </div>
  )
}

export default App
