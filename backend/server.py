from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List, Optional
import logging
import os

# Local imports
from models import (
    UserCreate, UserLogin, UserResponse, Category, QuizCreate, 
    QuizResponse, Quiz, QuizSubmission, QuizResultResponse,
    LeaderboardEntry, UserProgress, Badge, RecentActivity
)
from auth import hash_password, verify_password, create_access_token, get_current_user, security
from database import (
    db, users_collection, categories_collection, quizzes_collection, 
    results_collection, init_categories, close_db_connection
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI()

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============================================
# AUTH ENDPOINTS
# ============================================

@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    # Proveri da li korisnik već postoji
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email već postoji")
    
    existing_username = await users_collection.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Korisničko ime već postoji")
    
    # Kreiraj novog korisnika
    from models import User
    user = User(
        email=user_data.email,
        username=user_data.username,
        password=hash_password(user_data.password)
    )
    
    await users_collection.insert_one(user.dict())
    
    # Generiši token
    token = create_access_token({"user_id": user.id})
    
    return {
        "user": UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            avatar=user.avatar,
            isAdmin=user.isAdmin,
            totalScore=user.totalScore,
            quizzesCompleted=user.quizzesCompleted
        ),
        "token": token
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    # Pronađi korisnika
    user = await users_collection.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Neispravni podaci za prijavu")
    
    # Generiši token
    token = create_access_token({"user_id": user["id"]})
    
    return {
        "user": UserResponse(
            id=user["id"],
            email=user["email"],
            username=user["username"],
            avatar=user.get("avatar", "👤"),
            isAdmin=user.get("isAdmin", False),
            totalScore=user.get("totalScore", 0),
            quizzesCompleted=user.get("quizzesCompleted", 0)
        ),
        "token": token
    }

@api_router.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        avatar=user.get("avatar", "👤"),
        isAdmin=user.get("isAdmin", False),
        totalScore=user.get("totalScore", 0),
        quizzesCompleted=user.get("quizzesCompleted", 0)
    )

# ============================================
# CATEGORIES ENDPOINTS
# ============================================

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await categories_collection.find().to_list(100)
    return [Category(**cat) for cat in categories]

# ============================================
# QUIZZES ENDPOINTS
# ============================================

@api_router.get("/quizzes", response_model=List[QuizResponse])
async def get_quizzes(
    categoryId: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None
):
    query = {}
    
    if categoryId and categoryId != "all":
        query["categoryId"] = categoryId
    
    if difficulty and difficulty != "all":
        query["difficulty"] = difficulty
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    quizzes = await quizzes_collection.find(query).to_list(1000)
    
    result = []
    for quiz in quizzes:
        result.append(QuizResponse(
            id=quiz["id"],
            title=quiz["title"],
            description=quiz["description"],
            categoryId=quiz["categoryId"],
            difficulty=quiz["difficulty"],
            questionCount=quiz["questionCount"],
            timeLimit=quiz["timeLimit"],
            plays=quiz.get("plays", 0),
            rating=quiz.get("rating", 0.0),
            createdBy=quiz.get("createdBy", "Anonimno")
        ))
    
    return result

@api_router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    quiz = await quizzes_collection.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Kviz nije pronađen")
    
    return quiz

@api_router.get("/quizzes/{quiz_id}/questions")
async def get_quiz_questions(quiz_id: str):
    quiz = await quizzes_collection.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Kviz nije pronađen")
    
    # Ne šalji tačne odgovore
    questions = quiz.get("questions", [])
    safe_questions = []
    for q in questions:
        safe_q = q.copy()
        if "correctAnswer" in safe_q:
            del safe_q["correctAnswer"]
        safe_questions.append(safe_q)
    
    return safe_questions

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()