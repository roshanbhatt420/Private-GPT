import os 
async def fetch_files(folder_name="uploaded_pdfs"):
    file=[i for i in os.listdir(folder_name) if os.path.isfile(os.path.join(folder_name,i))]
    return file