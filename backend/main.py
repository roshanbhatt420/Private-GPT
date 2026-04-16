
from fastapi import FastAPI
from routes import api_chat ,api_ingest,api_file
from fastapi.middleware.cors import CORSMiddleware
 
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)
app.include_router(api_chat.router, prefix="/chat")
app.include_router(api_ingest.router,prefix="/ingest")
app.include_router(api_file.router,prefix="/files")