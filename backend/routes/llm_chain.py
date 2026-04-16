from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate  
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from typer import prompt
from routes.vector_store import get_retriever
llm = ChatOllama(model="llama3")

retriever = get_retriever(vectorstore)

def make_prompt(context, question):
    template = """
    You are a helpful, precise assistant. Use the provided context to answer the user's question.

    ### CONTEXT:
    {context}

    ### RULES:
    1. If the answer is not contained within the context, say "I don't have enough information."
    2. Answer in maximum 4 bullet points only.
    3. Keep the answer under 100 words.
    4. Do not add extra explanation.

    ### QUESTION:
    {question}
    """
    prompt = ChatPromptTemplate.from_messages(template)
    return prompt 


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)




rag_chain = (
    {
        "context": retriever | format_docs,
        "question": RunnablePassthrough()
    }
    | make_prompt(context="{context}", question="{question}")
    | llm
    | StrOutputParser()
)

router_prompt = """
Decide whether the question requires document context.

Question: {question}

Answer only:
- "RAG" (if needs document context)
- "LLM" (if general knowledge)
"""

route_chain={"question": RunnablePassthrough()} | ChatPromptTemplate.from_template(router_prompt) | llm | StrOutputParser()
def route_question(question):
    route = route_chain.invoke(question)
    if route == "RAG":
        return rag_chain.invoke(question)
    else:
        return llm.invoke(question)