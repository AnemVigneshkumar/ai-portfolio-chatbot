from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from chat_service import ChatService

app = FastAPI(title="AI Portfolio Chatbot Backend")

# Enable CORS so your React frontend (localhost:5173) can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize your ChatService instance
chat_service = ChatService()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    return StreamingResponse(
        chat_service.stream_message(request.message),
        media_type="text/event-stream"
    )