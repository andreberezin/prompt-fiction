import './styles/App.scss'
import NavBar from "./components/main/NavBar.tsx";
import {useState} from "react";
import type {ContentType} from "./types/ContentType.ts";
import Blog from "./components/main/Blog.tsx";
import {SocketProvider} from "./components/context/SocketProvider.tsx";
import Email from "./components/main/Email.tsx";

function App() {
    const [contentType, setContentType] = useState<ContentType>('blog');

  return (
      <SocketProvider>
    <div className={'ghostwriter'}>
        <NavBar contentType={contentType} setContentType={setContentType}/>
        {contentType === 'blog' && <Blog contentType={contentType}/> }
        {contentType === 'email' && <Email contentType={contentType}/> }
    </div>
      </SocketProvider>
  )
}

export default App
