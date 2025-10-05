import './styles/App.scss'
import NavBar from "./components/NavBar.tsx";
import {useState} from "react";
import type {ContentType} from "./types/content.ts";
import BlogForm from "./components/BlogForm.tsx";
import EmailForm from "./components/EmailForm.tsx";

function App() {
    const [contentType, setContentType] = useState<ContentType>('blog')

  return (
    <div id={'ghostwriter'}>
        <NavBar contentType={contentType} setContentType={setContentType}/>
        {contentType === 'blog' && <BlogForm/> }
        {contentType === 'email' && <EmailForm/> }
    </div>
  )
}

export default App
