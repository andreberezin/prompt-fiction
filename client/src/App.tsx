import './styles/App.scss'
import NavBar from "./components/NavBar.tsx";
import {useEffect, useRef, useState} from "react";
import type {ContentType} from "./types/ContentType.ts";
import BlogForm from "./components/BlogForm.tsx";
import EmailForm from "./components/EmailForm.tsx";
import SocketHandler from "./sockets/SocketHandler.ts";
import type {Client} from "@stomp/stompjs";
import type BlogResponseType from "./types/BlogResponse.ts";

function App() {
    const [contentType, setContentType] = useState<ContentType>('blog');
    const [retryCounter, setRetryCounter] = useState<number>(0);
    const [status, setStatus] = useState<string>("");
    const stompClientRef = useRef<Client | null | undefined>(null);
    const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);

    const [blogResponse, setBlogResponse] = useState<BlogResponseType>({
        title: '',
        sections: [],
        metadata: {
            wordCount: 0,
            estimatedReadTime: '0 min',
            seoKeywords: [],
        },
        exportFormats: {
            markdown: '',
            plainText: '',
            pdfReady: false,
        },
        content: '',
        attempts: 0,
    });

    // establish a websocket connection
    useEffect(() => {
        const socketHandler = new SocketHandler();
        stompClientRef.current = socketHandler.createSocketConnection(setRetryCounter, setStatus, setBlogResponse, isEditingMarkdown);
        return () => {stompClientRef.current?.deactivate()}
    }, [])


  return (
    <div id={'ghostwriter'}>
        <NavBar contentType={contentType} setContentType={setContentType}/>
        {contentType === 'blog' && <BlogForm blogResponse={blogResponse} setBlogResponse={setBlogResponse} retryCounter={retryCounter} setRetryCounter={setRetryCounter} status={status} setStatus={setStatus} stompClient={stompClientRef} setIsEditingMarkdown={setIsEditingMarkdown}/> }
        {contentType === 'email' && <EmailForm/> }
    </div>
  )
}

export default App
