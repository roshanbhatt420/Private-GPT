from fastapi import APIRouter
from pydantic import BaseModel
from .llm import generate_response
import asyncio

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post('/')
async def send_message(request: ChatRequest): 
    if not request.message.strip():
        return {"error": "Message cannot be empty."}
        
    response = await generate_response(request.message)
    return {"response": response}

async def test_main():
    res = await send_message(ChatRequest(message="What is the capital of France?"))
    print(res)

if __name__ == "__main__":
    asyncio.run(test_main())