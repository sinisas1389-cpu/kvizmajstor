from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List, Optional
import logging
import os

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

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email već postoji")
    
    existing_username = await users_collection.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Korisničko ime već postoji")
    
    from models import User
    user = User(
        email=user_data.email,
        username=user_data.username,
        password=hash_password(user_data.password)
    )
    
    await users_collection.insert_one(user.dict())
    token = create_access_token({"user_id": user.id})
    
    return {
        "user": UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            avatar=user.avatar,
            isAdmin=user.isAdmin,
            isCreator=user.isCreator,
            totalScore=user.totalScore,
            quizzesCompleted=user.quizzesCompleted
        ),
        "token": token
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await users_collection.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Neispravni podaci za prijavu")
    
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

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await categories_collection.find().to_list(100)
    return [Category(**cat) for cat in categories]

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
    
    questions = quiz.get("questions", [])
    safe_questions = []
    for q in questions:
        safe_q = q.copy()
        if "correctAnswer" in safe_q:
            del safe_q["correctAnswer"]
        safe_questions.append(safe_q)
    
    return safe_questions

@api_router.post("/quizzes")
async def create_quiz(quiz_data: QuizCreate, user_id: str = Depends(get_current_user)):
    user = await users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    # Proveri da li korisnik ima privilegije za kreiranje kvizova
    if not user.get("isAdmin", False) and not user.get("isCreator", False):
        raise HTTPException(status_code=403, detail="Nemate dozvolu za kreiranje kvizova")
    
    quiz = Quiz(
        title=quiz_data.title,
        description=quiz_data.description,
        categoryId=quiz_data.categoryId,
        difficulty=quiz_data.difficulty,
        questionCount=len(quiz_data.questions),
        timeLimit=quiz_data.timeLimit,
        createdBy=user["username"],
        questions=[q.dict() for q in quiz_data.questions]
    )
    
    await quizzes_collection.insert_one(quiz.dict())
    await categories_collection.update_one({"id": quiz_data.categoryId}, {"$inc": {"quizCount": 1}})
    
    return QuizResponse(
        id=quiz.id, title=quiz.title, description=quiz.description,
        categoryId=quiz.categoryId, difficulty=quiz.difficulty,
        questionCount=quiz.questionCount, timeLimit=quiz.timeLimit,
        plays=quiz.plays, rating=quiz.rating, createdBy=quiz.createdBy
    )

@api_router.post("/quizzes/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, submission: QuizSubmission, user_id: str = Depends(get_current_user)):
    quiz = await quizzes_collection.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Kviz nije pronađen")
    
    questions = quiz["questions"]
    correct_count = 0
    total_questions = len(questions)
    
    for answer in submission.answers:
        question = next((q for q in questions if q["id"] == answer.questionId), None)
        if question:
            if answer.answer == question["correctAnswer"]:
                correct_count += 1
    
    score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
    passed = score >= 70
    
    from models import QuizResult
    result = QuizResult(
        userId=user_id, quizId=quiz_id, score=score,
        correctCount=correct_count, totalQuestions=total_questions, passed=passed
    )
    
    await results_collection.insert_one(result.dict())
    await users_collection.update_one({"id": user_id}, {"$inc": {"totalScore": score, "quizzesCompleted": 1}})
    await quizzes_collection.update_one({"id": quiz_id}, {"$inc": {"plays": 1}})
    
    return QuizResultResponse(score=score, correctCount=correct_count, totalQuestions=total_questions, passed=passed)

@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard():
    users = await users_collection.find().sort("totalScore", -1).limit(50).to_list(50)
    return [LeaderboardEntry(
        id=u["id"], username=u["username"],
        score=u.get("totalScore", 0), quizzesCompleted=u.get("quizzesCompleted", 0),
        avatar=u.get("avatar", "👤")
    ) for u in users]

@api_router.get("/users/progress")
async def get_user_progress(user_id: str = Depends(get_current_user)):
    user = await users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    results = await results_collection.find({"userId": user_id}).sort("completedAt", -1).limit(10).to_list(10)
    recent_activity = []
    
    for result in results:
        quiz = await quizzes_collection.find_one({"id": result["quizId"]})
        if quiz:
            from datetime import datetime
            time_diff = datetime.utcnow() - result["completedAt"]
            if time_diff.days > 0:
                date_str = f"pre {time_diff.days} dana"
            elif time_diff.seconds // 3600 > 0:
                date_str = f"pre {time_diff.seconds // 3600} sati"
            else:
                date_str = f"pre {time_diff.seconds // 60} minuta"
            
            recent_activity.append(RecentActivity(
                quizTitle=quiz["title"], score=result["score"], date=date_str
            ))
    
    all_users = await users_collection.find().sort("totalScore", -1).to_list(10000)
    rank = 1
    for idx, u in enumerate(all_users):
        if u["id"] == user_id:
            rank = idx + 1
            break
    
    total_quizzes = user.get("quizzesCompleted", 0)
    badges = [
        Badge(id="1", name="Prvi Kviz", icon="🎯", earned=total_quizzes >= 1),
        Badge(id="2", name="Savršen Rezultat", icon="💯", earned=False),
        Badge(id="3", name="10 Kvizova", icon="🔟", earned=total_quizzes >= 10),
        Badge(id="4", name="Brzinski Demon", icon="⚡", earned=False),
        Badge(id="5", name="Majstor Kategorije", icon="👑", earned=False)
    ]
    
    average_score = user.get("totalScore", 0) // total_quizzes if total_quizzes > 0 else 0
    
    return UserProgress(
        totalQuizzes=total_quizzes, totalScore=user.get("totalScore", 0),
        averageScore=average_score, rank=rank, badges=badges, recentActivity=recent_activity[:3]
    )

# ============================================
# ADMIN ENDPOINTS - UPRAVLJANJE KREATORIMA
# ============================================

@api_router.get("/admin/users")
async def get_all_users(user_id: str = Depends(get_current_user)):
    # Proveri da li je korisnik admin
    admin = await users_collection.find_one({"id": user_id})
    if not admin or not admin.get("isAdmin", False):
        raise HTTPException(status_code=403, detail="Samo admin može pristupiti ovoj funkciji")
    
    users = await users_collection.find().to_list(1000)
    return [UserResponse(
        id=u["id"], email=u["email"], username=u["username"],
        avatar=u.get("avatar", "👤"), isAdmin=u.get("isAdmin", False),
        isCreator=u.get("isCreator", False),
        totalScore=u.get("totalScore", 0), quizzesCompleted=u.get("quizzesCompleted", 0)
    ) for u in users]

@api_router.put("/admin/users/{target_user_id}/creator")
async def toggle_creator_status(target_user_id: str, user_id: str = Depends(get_current_user)):
    # Proveri da li je korisnik admin
    admin = await users_collection.find_one({"id": user_id})
    if not admin or not admin.get("isAdmin", False):
        raise HTTPException(status_code=403, detail="Samo admin može dodavati kreatore")
    
    target_user = await users_collection.find_one({"id": target_user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    # Toggle creator status
    new_status = not target_user.get("isCreator", False)
    await users_collection.update_one(
        {"id": target_user_id},
        {"$set": {"isCreator": new_status}}
    )
    
    return {"message": f"Kreator status {'aktiviran' if new_status else 'deaktiviran'}", "isCreator": new_status}

@api_router.get("/")
async def root():
    return {"message": "KvizMajstor API - Dobrodošli!"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_categories()
    logger.info("✅ Backend server started")

@app.on_event("shutdown")
async def shutdown_event():
    await close_db_connection()
    logger.info("🛑 Backend server stopped")
