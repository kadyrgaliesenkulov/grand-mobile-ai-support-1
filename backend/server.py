
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_agent import analyze_complaint

app = FastAPI(
    title="Grand Mobile AI Support API"
)

# Frontend пен Backend байланысы
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Шағымның мәліметтері
class Complaint(BaseModel):

    nickname: str = Field(
        min_length=1,
        max_length=40
    )

    reported_nick: str = Field(
        default="",
        max_length=40
    )

    category: str = "auto"

    description: str = Field(
        min_length=10,
        max_length=3000
    )

    evidence_url: str = ""


# Серверді тексеру
@app.get("/")
def home():

    return {
        "message": "Grand Mobile AI Support API жұмыс істеп тұр"
    }


# Шағым қабылдау
@app.post("/api/complaints")
def create_complaint(complaint: Complaint):

    result = analyze_complaint(
        complaint.model_dump()
    )

    return result
