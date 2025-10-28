import './styles/App.scss'
import NavBar from "./components/main/NavBar.tsx";
import {useState} from "react";
import type {ContentType} from "./types/ContentType.ts";
import EmailForm from "./components/form-input/EmailForm.tsx";
import Blog from "./components/main/Blog.tsx";
import {SocketProvider} from "./components/context/SocketProvider.tsx";

function App() {
    const [contentType, setContentType] = useState<ContentType>('blog');

  return (
      <SocketProvider>
    <div className={'ghostwriter'}>
        <NavBar contentType={contentType} setContentType={setContentType}/>
        {/*{contentType === 'blog' && <BlogForm blogResponse={blogResponse} setBlogResponse={setBlogResponse} retryCounter={retryCounter} setRetryCounter={setRetryCounter} status={status} setStatus={setStatus} stompClient={stompClientRef}/> }*/}
        {/*{contentType === 'email' && <EmailForm/> }*/}
        {contentType === 'blog' && <Blog/> }
        {contentType === 'email' && <EmailForm/> }
    </div>
      </SocketProvider>
  )
}

export default App
