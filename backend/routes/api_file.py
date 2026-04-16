from fastapi import APIRouter
from .fetchfile import fetch_files
router = APIRouter()
@router.get('/')
async def get_files():
    files = await fetch_files()
    print(files)
    return {"files": files}