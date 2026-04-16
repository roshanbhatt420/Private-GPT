
import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_loaders import Docx2txtLoader
from langchain_core.documents import Document
def extract_text_from_pdf(file_path):

    filename,extension = os.path.splitext(file_path)
    try : 
     if extension.lower() == ".pdf":
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        return documents
     elif extension.lower()==".docs":
        loader=Docx2txtLoader(file_path)
        documents=loader.load()
        return documents
     elif extension.lower()==".txt":
        with open(file_path, "r", encoding="utf-8") as f:
         text = f.read()

        documents = [
            Document(
            page_content=text,
            metadata={"source": file_path}
        )
        ]
        return documents
     else:
        return {"message": "Unsupported file format. Please upload a PDF, DOCX, or TXT file."}
    except Exception as e:
        return {"message": f"Error loading document: {str(e)}"}