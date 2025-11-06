# 🧠 Prompt Fiction

**Prompt Fiction** is an intelligent content generation tool that transforms user inputs into ready-to-use content across multiple formats — currently supports blog posts and emails.  
It connects a **React + TypeScript** frontend with a **Spring Boot + Java** backend and integrates real-time AI-generated feedback through sockets for an interactive writing experience.

---

## 🚀 Features

- ✍️ **AI-Powered Content Generation** — Automatically creates structured and formatted text (blog posts, emails, etc.) using different AI models.
- 🔄 **Automatic Updates** — When the user edits the AI-generated markdown, the system intelligently updates the content (other formats, word count, read time) in real-time.
- ⚡  **Socket-Based Real-Time Feedback** — Provides live progress updates and retry notifications.
- 🧠 **Smart Validation & Re-Prompting** — Detects invalid or incomplete AI responses and automatically regenerates them.
- ❗ **Smart Error Handling** — Lets the user know if the AI API ran into an error and which error it ran into.
- 🪄 **Markdown format** — Responses include hierarchical headings and metadata, like SEO keywords, for easy parsing and formatting.
- 📝 **Plain text format** — Responses also include a plain text format.
- 📄 **PDF Export** — Export the response into a pdf format and download it.

---

## ⚙️ Installation & Setup

If you want to skip all this then just go to the live Render website: https://prompt-fiction.onrender.com/
- NB! Might take some time for the servers to wake up and the API requests and WS connections might be a bit slower to react.

**Requirements:** Java 21, Maven, Node.js (v16+), npm

## Run both the backend (Spring Boot) and frontend (React + Vite) locally:

**Setup:**
1. Clone the repository and navigate to the directory.
    ```sh
   git clone https://github.com/andreberezin/prompt-fiction.git
   ```
    ```sh
   cd prompt-fiction
   ```

2. Get yourself a Gemini API Key from https://ai.google.dev/gemini-api/docs/quickstart
   1. Export the API key:
   ```sh
    export GEMINI_API_KEY="<YOUR_KEY_HERE>"
    ```
   
### Run without Docker:

3. Install dependencies:
   ```sh
   npm install
   ```

4. Start the backend and frontend servers with one command:
   ```sh
   npm run dev
   ```
- The backend will run on [http://localhost:8080](http://localhost:8080). 
- The frontend will run on [http://localhost:5173](http://localhost:5173).


### Run with Docker:

**Requirements:** Docker

3. Create the .env files in /client and /server according to the .env.example files. Add the necessary values.
   ```sh
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

4. Build and run the Docker container:
   ```sh
   chmod +x start.sh
   ./start.sh
   ```
- The application will run on [http://localhost:8080](http://localhost:8080).

---

## 🧭 Usage Guide

Here's how to get started with Prompt Fiction:

1. **Select Content Type**
    - Choose between **Blog** or **Email** from the content type selector at the top of the interface.

2. **Enter Request Details**
    - Fill in the request form with details such as topic, tone (e.g., friendly, formal), target word count, and any specific requirements.

3. **Generate Content**
    - Click the **Generate** button. The system will send your request to the backend, and you’ll see real-time progress updates as the AI generates your content.

4. **Edit and Auto-Update Content**
    - You can edit the AI-generated markdown directly but you cannot edit the plain text directly. Any changes you make will trigger smart auto-updates, regenerating only the relevant sections.

5. **Validate and Download Results**
    - The system automatically validates the content for completeness and structure. You can download your content as a PDF or copy it in markdown format.

6. **Switch AI Models**
    - If needed, switch between available Gemini models using the model selector.

**NB! It is recommended that you use the gemini-2.5-flash-lite model if you're on Gemini's free tier because that has the largest rate limit (max 15 requests per minute). 
The gemini-2.5-flash is also good (max 10 requests per minute) but gemini-2.5-pro has a rate limit of only up to 2 requests per minute**

---

## 🧰 Tech Stack

**Frontend:**
- React (Vite) + TypeScript
- SCSS for styling
- WebSockets for real-time communication

**Backend:**
- Java + Spring Boot
- REST & STOMP over WebSocket
- PDF generation using iText
- AI integration (Google Gemini)

---

## 🧩 Architecture Overview

1. **Frontend (React/TS)** sends a structured `Request` (blog, email, etc.) to the backend.
2. **Backend (Spring Boot)** builds a contextual AI prompt and requests content generation from the selected model.
3. The AI response is validated, structured into markdown, and sent back to the frontend. 
   - Meanwhile, automatic status updates are send to the user via a WebSocket connection.
4. Users can edit and trigger **auto-updates** that regenerate only the changed parts.

---

## ✅ To-Do

- [ ] Implement full **automatic model fallback** with live retry notifications.
- [ ] Add more **content type plugins** (social media posts, newsletters, ad copy).
- [ ] Add a **rich text format** for more versatility.
- [ ] Improve **PDF layout and typography** for different content types.
- [ ] Introduce **more options to configure the AI response** (temperature, topP).
- [ ] Add **history** so the user can see their previous content.
- [ ] Add **more AI model options** to include other models like OpenAI etc.

---

## ⚙️ Main Challenges

- Handling **AI inconsistencies** (missing headers, wrong structure, incomplete markdown).
- Building a **two-way real-time socket system** for updating content seamlessly.
- Synchronizing **frontend state** with live backend updates without causing race conditions.
- Managing **type safety** across TypeScript and Java .

---

## 🧠 Main Learning Points

- My **first time using TypeScript**, focusing on strong typing.
- My **first Spring Boot project in a while** — previously I've been doing more of the frontend work.
- Built an **AI prompt generation pipeline** that dynamically adjusts context, tone, and structure based on user input.
- Learned how to **validate and repair** inconsistent AI responses with Java logic.
- Gained experience with **real-time systems**, **markdown parsing**, and **multi-format export logic**.

---

## 🌟 Extras

- 🕓 **Real-time socket-based feedback** with live status updates
- ✨ **Automatic updating** of AI content when user edits markdown directly.
- 🧠 **Multiple AI model options** — user can select between different Google Gemini 2.5 models.
- 📋 **One-click content copying** for easy use in external apps.
- ⌛ **Live generation time and retry count** to let the user know what's going on.

---

### 💡 Summary
Prompt Fiction is a full-stack AI content assistant that merges **prompt engineering**, **real-time feedback**, and **smart content structuring** into a single smooth workflow.