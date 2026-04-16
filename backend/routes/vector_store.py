# importing the neccessary  libraru
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
OllamaEmbeddings = OllamaEmbeddings(model="llama3")
def vector_store(documents):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    vectorstore = Chroma.from_documents(splits,embedding=OllamaEmbeddings,collection_name="private-gpt",persist_directory="./chroma_db")
    return vectorstore

def get_retriever(vectorstore):
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    return retriever