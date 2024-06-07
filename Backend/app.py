from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from langchain.chains import RetrievalQA
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os 
from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader


load_dotenv()
llm = ChatOpenAI()
embeddings = OpenAIEmbeddings()


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    query: str



@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile= File(...)):
    temp_file = file.filename
    with open(temp_file, "wb") as buffer:
        buffer.write(await file.read()) 
    loader = PyPDFLoader(temp_file)
    documents = loader.load_and_split()
    os.remove(temp_file)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=64)
    texts = text_splitter.split_documents(documents)   
    metadatas = [{"source":f"{i + 1 }-pl"} for i in range(len(texts))]
    for i, doc in enumerate(texts):
        doc.metadata['source'] = metadatas[i]['source']
    Chroma.from_documents(texts, embeddings, persist_directory="./chroma_db")
    return {"Pdf Uploaded"}

@app.post("/query/")
def process_pdf_and_search(item: Item):
    db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
    qa = RetrievalQA.from_chain_type(llm, chain_type="stuff", retriever=db.as_retriever(search_kwargs={"k": 1}), return_source_documents=True)
    docs = qa.invoke(item.query)
    result = docs['result']
    source_documents = docs['source_documents']
    sources = [doc.metadata['source'] for doc in source_documents]
    return {"result": result, "sources": sources}


@app.get("/getData/")
def highlight_matching_data(source: int): 
    db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
    docs = db.get()
    return docs['documents'][source-1]
