
from langchain_ollama import ChatOllama

llm = ChatOllama(model="llama3")
async def generate_response(prompt):
    response=llm.invoke(prompt)
    return response.content

