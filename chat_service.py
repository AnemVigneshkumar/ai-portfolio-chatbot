import os
#imports Python's built in operating system module, which allows interaction with environment variables and system
from dotenv import load_dotenv
#load_dotenv is imported from dotenv library, which is used to read key value pairs from .env file and loads them in to system's envirnoment variables
from langchain_google_genai import ChatGoogleGenerativeAI
#imports LangChain's ChatGoogleGenerativeAI class, which is used to interact with Google's generative AI models
from langchain_core.messages import HumanMessage, AIMessage
imports data classes that represent converstaion roles in LangChain. HumanMessage represents a message from a human user, while AIMessage represents a message from the AI model.


load_dotenv(encoding="utf-8-sig")
#load_dotenv funciton is used to load .env file contents into the os environment. So that after we can get the API keys values from the os by using  like os.getenv("GEMINI_API_KEY").
#encoding="utf-8-sig": A safeguard parameter that tells Python to automatically detect and strip out any hidden Byte Order Mark (BOM) characters that text editors on Windows sometimes inject into files, preventing None lookup errors.

class ChatService:
    def __init__(self):
        # Direct use of os.getenv as requested!
        self.api_key = os.getenv("GEMINI_API_KEY")
        #os.getenv("Gemini_API_KEY") retrieves the value of the environment variable GEMINI_API_KEY, which is expected to be set in the .env file.That means when we use load_dotenv then the key values there .env file are loaded as environment variables in os or system This key is essential for authenticating requests to Google's generative AI services.

        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is missing. Check your .env file.")

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash-lite",
            google_api_key=self.api_key,
            max_output_tokens=1024
        )

        self.messages = []
        #self.messages = []: Initializes an empty Python list ([]) as an instance variable to hold the short-term conversation memory history.
    
    def stream_message(self, user_message: str):
        self.messages.append(HumanMessage(content=user_message))
        recent_messages = self.messages[-6:]

        full_response = ""
        for chunk in self.llm.stream(recent_messages):
            raw_content = chunk.content
            
            if isinstance(raw_content, list):  
                chunk_text = "".join([item.get("text", "") if isinstance(item, dict) else str(item) for item in raw_content])
            else:
                chunk_text = str(raw_content)
            
            if chunk_text:
                full_response += chunk_text
                yield chunk_text

        self.messages.append(AIMessage(content=full_response))