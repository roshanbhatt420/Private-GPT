from fastapi import APIRouter,UploadFile ,File  ,HTTPException
import os
from .extract_content import extract_text_from_pdf

router = APIRouter()
@router.put('/')
async def ingest_file(file: UploadFile = File(...)):
    UPLOAD_DIR = "uploaded_pdfs"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    documents = extract_text_from_pdf(file_path)
    

    # Save file
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)

    return {"message": "File uploaded successfully"}
    