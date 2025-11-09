# backend/server.py
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List, Optional
import logging

from models import (
    UserCreate, UserLogin, UserResponse, Category, QuizCreate,
    QuizResponse, Quiz, QuizSubmission, QuizResultResponse,
    LeaderboardEntry, UserProgress, Badge, RecentActivity
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_current_user_optional
)
from database import (
    db, users_collection, categories_collection, quizzes_collection,
    results_collection, init_categories, close_db_connection
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="KvizMajstor API", version="1.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ====== CORS (allow current frontend domains) ======
ALLOWED_ORIGINS = [
    "https://kvizmajstor.com",
    "https://kvizmajstor.vercel.app",
    "https://kvizmajstor-oqt5hx13h-sinisa-trbojevics-projects.vercel.app",
    "https://kvizmajstor.emapp.cloud",
    "http://localhost:3000",
]

# If you don't use cookie-based auth in browser, keep allow_credentials=False.
# If you use cookies, set allow_credentials=True but DO NOT use ["*"] for origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====== Health check ======
@app.get("/health")
async def health():
    return JSONResponse(content={"status": "ok"}, media_type="application/json")

# ====== Auth ======
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

    return JSONResponse(
        content={
            "user": UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                avatar=user.avatar,
                isAdmin=user.isAdmin,
                isCreator=user.isCreator,
                totalScore=user.totalScore,
                quizzesCompleted=user.quizzesCompleted
            ).dict(),
            "token": token
        },
        media_type="application/json"
    )

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await users_collection.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Neispravni podaci za prijavu")

    token = create_access_token({"user_id": user["id"]})

    return JSONResponse(
        content={
            "user": UserResponse(
                id=user["id"],
                email=user["email"],
                username=user["username"],
                avatar=user.get("avatar", "👤"),
                isAdmin=user.get("isAdmin", False),
                isCreator=user.get("isCreator", False),
                totalScore=user.get("totalScore", 0),
                quizzesCompleted=user.get("quizzesCompleted", 0)
            ).dict(),
            "token": token
        },
        media_type="application/json"
    )

@api_router.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    return JSONResponse(
        content=UserResponse(
            id=user["id"],
            email=user["email"],
            username=user["username"],
            avatar=user.get("avatar", "👤"),
            isAdmin=user.get("isAdmin", False),
            isCreator=user.get("isCreator", False),
            totalScore=user.get("totalScore", 0),
            quizzesCompleted=user.get("quizzesCompleted", 0)
        ).dict(),
        media_type="application/json"
    )

# ====== Categories ======
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await categories_collection.find().to_list(100)
    return [Category(**cat) for cat in categories]

# ====== Quizzes ======
@api_router.get("/quizzes", response_model=List[QuizResponse])
async def get_quizzes(categoryId: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if categoryId and categoryId != "all":
        query["categoryId"] = categoryId
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
            questionCount=quiz["questionCount"],
            timeLimit=quiz.get("timeLimit", 0),
            plays=quiz.get("plays", 0),
            rating=quiz.get("rating", 0.0),
            createdBy=quiz.get("createdBy", "Anonimno")
        ))

    return JSONResponse(content=[r.dict() for r in result], media_type="application/json")

@api_router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    quiz = await quizzes_collection.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Kviz nije pronađen")

    return JSONResponse(
        content=QuizResponse(
            id=quiz["id"],
            title=quiz["title"],
            description=quiz["description"],
            categoryId=quiz["categoryId"],
            questionCount=quiz["questionCount"],
            timeLimit=quiz.get("timeLimit", 0),
            plays=quiz.get("plays", 0),
            rating=quiz.get("rating", 0.0),
            createdBy=quiz.get("createdBy", "Anonimno")
        ).dict(),
        media_type="application/json"
    )

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
        if "_id" in safe_q:
            del safe_q["_id"]
        safe_questions.append(safe_q)

    return JSONResponse(content=safe_questions, media_type="application/json")

@api_router.get("/quizzes/{quiz_id}/edit")
async def get_quiz_for_edit(quiz_id: str, user_id: str = Depends(get_current_user)):
    user = await users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    quiz = await quizzes_collection.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Kviz nije pronađen")

    if not user.get("isAdmin", False) and quiz.get("createdBy") != user["username"]:
        raise HTTPException(status_code=403, detail="Nemate dozvolu za uređivanje ovog kviza")

    if "_id" in quiz:
        del quiz["_id"]

    questions = quiz.get("questions", [])
    clean_questions = []
    for q in questions:
        clean_q = q.copy()
        if "_id" in clean_q:
            del clean_q["_id"]
        clean_questions.append(clean_q)

    quiz["questions"] = clean_questions
    return JSONResponse(content=quiz, media_type="application/json")

@api_router.post("/quizzes")
async def create_quiz(quiz_data: QuizCreate, user_id: str = Depends(get_current_user)):
    user = await users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if not user.get("isAdmin", False) and not user.get("isCreator", False):
        raise HTTPException(status_code=403, detail="Nemate dozvolu za kreiranje kvizova. Samo Admin i Kreatori mogu kreirati kvizove.")

    quiz = Quiz(
        title=quiz_data.title,
        description=quiz_data.description,
        categoryId=quiz_data.categoryId,
        questionCount=len(quiz_data.questions),
        timeLimit=quiz_data.timeLimit if quiz_data.timeLimit else 0,
        createdBy=user["username"],
        questions=[q.dict() for q in quiz_data.questions]
    )

    await quizzes_collection.insert_one(quiz.dict())
    await categories_collection.update_one({"id": quiz_data.categoryId}, {"$inc": {"quizCount": 1}})

    return JSONResponse(
        content=QuizResponse(
            id=quiz.id, title=quiz.title, description=quiz.description,
            categoryId=quiz.categoryId, questionCount=quiz.questionCount,
            timeLimit=quiz.timeLimit, plays=quiz.plays, rating=quiz.rating,
            createdBy=quiz.createdBy
        ).dict(),
        media_type="application/json"
    )

@api_router.put("/quizzes/{quiz_id}")
async def update_quiz(quiz_id: str, quiz_data: QuizCreate, user_id: str = Depends(get_current_user)):
    user = await users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if not user.get("isAdmin", False) and not user.get("isCreator", False):
        raise HTTPException(status_code=403, detail="Nemate dozvolu za uređivanje kvizova")

    existing_quiz = await quizzes_collection.find_one({"id": quiz_id})
    if not existing_quiz:
        raise HTTPException(status_code=404, detail="Kviz nije pronađen")

    if not user.get("isAdmin", False) and existing_quiz.get("createdBy") != user["username"]:
        raise HTTPException(status_code=403, detail="Možete uređivati samo svoje kvizove")

    old_category_id = existing_quiz.get("categoryId")
    if old_category_id != quiz_data.categoryId:
        await categories_collection.update_one({"id": old_category_id}, {"$inc": {"quizCount": -1}})
        await categories_collection.update_one({"id": quiz_data.categoryId}, {"$inc": {"quizCount": 1}})

    update_data = {
        "title": quiz_data.title,
        "description": quiz_data.description,
        "categoryId": quiz_data.categoryId,
        "questionCount": len(quiz_data.questions),
        "timeLimit": quiz_data.timeLimit if quiz_data.timeLimit else 0,
        "questions": [q.dict() for q in quiz_data.questions]
    }

    await quizzes_collection.update_one({"id": quiz_id}, {"$set": update_data})
    return JSONResponse(content={"message": "Kviz uspešno ažuriran"}, media_type="application/json")

@api_router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str, user_id: str = Depends(get_current_user)):
    user = await users_collection.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if not user.get("isAdmin", False) and not user.get("isCreator", False):
        raise HTTPException(status_code=403, detail="Nemate dozvolu za brisanje kvizova")

    quiz = await quizzes_collection.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Kviz nije pronađen")

    if not user.get("isAdmin", False) and quiz.get("createdBy") != user["username"]:
        raise HTTPException(status_code=403, detail="Možete brisati samo svoje kvizove")

    await quizzes_collection.delete_one({"id": quiz_id})
    await categories_collection.update_one({"id": quiz.get("categoryId")}, {"$inc": {"quizCount": -1}})

    return JSONResponse(content={"message": "Kviz uspešno obrisan"}, media_type="application/json")

@api_router.post("/quizzes/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, submission: QuizSubmission, user_id: str = Depends(get_current_user_optional)):
    quiz = await quizzes_collection.find_one({"id": quiz_id})
    if not quiz:
        raise HTTPException(status_code=404, detail="Kviz nije pronađen")

    questions = quiz["questions"]
    correct_count = 0
    total_questions = len(questions)

    for answer in submission.answers:
        question = next((q for q in questions if q["id"] == answer.questionId), None)
        if question:
            user_answer = answer.answer
            correct_answer = question["correctAnswer"]

            if isinstance(user_answer, bool):
                user_answer = str(user_answer).lower()
            if isinstance(correct_answer, bool):
                correct_answer = str(correct_answer).lower()

            if isinstance(user_answer, str):
                user_answer = user_answer.lower()
            if isinstance(correct_answer, str):
                correct_answer = str(correct_answer).lower()

            if user_answer == correct_answer:
                correct_count += 1

    score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
    passed = score >= 70

    if user_id:
        from models import QuizResult
        result = QuizResult(
            userId=user_id, quizId=quiz_id, score=score,
            correctCount=correct_count, totalQuestions=total_questions, passed=passed
        )

        await results_collection.insert_one(result.dict())
        await users_collection.update_one({"id": user_id}, {"$inc": {"totalScore": score, "quizzesCompleted": 1}})

    await quizzes_collection.update_one({"id": quiz_id}, {"$inc": {"plays": 1}})

    return JSONResponse(
        content=QuizResultResponse(score=score, correctCount=correct_count, totalQuestions=total_questions, passed=passed).dict(),
        media_type="application/json"
    )

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

    return JSONResponse(
        content=UserProgress(
            totalQuizzes=total_quizzes, totalScore=user.get("totalScore", 0),
            averageScore=average_score, rank=rank, badges=badges, recentActivity=recent_activity[:3]
        ).dict(),
        media_type="application/json"
    )

# ====== Admin ======
@api_router.get("/admin/users")
async def get_all_users(user_id: str = Depends(get_current_user)):
    admin = await users_collection.find_one({"id": user_id})
    if not admin or not admin.get("isAdmin", False):
        raise HTTPException(status_code=403, detail="Samo admin može pristupiti ovoj funkciji")

    users = await users_collection.find().to_list(1000)
    return JSONResponse(
        content=[UserResponse(
            id=u["id"], email=u["email"], username=u["username"],
            avatar=u.get("avatar", "👤"), isAdmin=u.get("isAdmin", False),
            isCreator=u.get("isCreator", False),
            totalScore=u.get("totalScore", 0), quizzesCompleted=u.get("quizzesCompleted", 0)
        ).dict() for u in users],
        media_type="application/json"
    )

@api_router.put("/admin/users/{target_user_id}/creator")
async def toggle_creator_status(target_user_id: str, user_id: str = Depends(get_current_user)):
    admin = await users_collection.find_one({"id": user_id})
    if not admin or not admin.get("isAdmin", False):
        raise HTTPException(status_code=403, detail="Samo admin može dodavati kreatore")

    target_user = await users_collection.find_one({"id": target_user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    new_status = not target_user.get("isCreator", False)
    await users_collection.update_one(
        {"id": target_user_id},
        {"$set": {"isCreator": new_status}}
    )

    return JSONResponse(
        content={"message": f"Kreator status {'aktiviran' if new_status else 'deaktiviran'}", "isCreator": new_status},
        media_type="application/json"
    )

@api_router.post("/admin/categories", response_model=Category)
async def create_category(category_data: dict, user_id: str = Depends(get_current_user)):
    admin = await users_collection.find_one({"id": user_id})
    if not admin or not admin.get("isAdmin", False):
        raise HTTPException(status_code=403, detail="Samo admin može dodavati kategorije")

    existing = await categories_collection.find_one({"name": category_data["name"]})
    if existing:
        raise HTTPException(status_code=400, detail="Kategorija sa ovim imenom već postoji")

    import uuid
    new_category = {
        "id": str(uuid.uuid4()),
        "name": category_data["name"],
        "icon": category_data["icon"],
        "color": category_data["color"],
        "quizCount": 0
    }

    await categories_collection.insert_one(new_category)
    return Category(**new_category)

@api_router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str, user_id: str = Depends(get_current_user)):
    admin = await users_collection.find_one({"id": user_id})
    if not admin or not admin.get("isAdmin", False):
        raise HTTPException(status_code=403, detail="Samo admin može brisati kategorije")

    quiz_count = await quizzes_collection.count_documents({"categoryId": category_id})
    if quiz_count > 0:
        raise HTTPException(status_code=400, detail=f"Ne možete obrisati kategoriju koja ima {quiz_count} kvizova")

    result = await categories_collection.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kategorija nije pronađena")

    return JSONResponse(content={"message": "Kategorija uspešno obrisana"}, media_type="application/json")

# ====== Root ======
@api_router.get("/")
async def root():
    return JSONResponse(content={"message": "KvizMajstor API - Dobrodošli!"}, media_type="application/json")

# ====== Sitemap XML (dynamic) ======
@app.get("/sitemap.xml")
async def sitemap_xml():
    quizzes = await quizzes_collection.find({}, {"id": 1}).to_list(10000)
    ids = [q["id"] for q in quizzes if "id" in q]

    parts = [
        "<?xml version='1.0' encoding='UTF-8'?>",
        "<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>",
        "  <url>",
        "    <loc>https://kvizmajstor.com/</loc>",
        "    <changefreq>weekly</changefreq>",
        "    <priority>1.0</priority>",
        "  </url>",
    ]
    for qid in ids:
        parts.extend([
            "  <url>",
            f"    <loc>https://kvizmajstor.com/quiz/{qid}</loc>",
            "    <changefreq>weekly</changefreq>",
            "    <priority>0.7</priority>",
            "  </url>",
        ])
    parts.append("</urlset>")
    xml_content = "\n".join(parts)
    return Response(content=xml_content, media_type="application/xml")

# ====== Mount API router and lifecycle events ======
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    await init_categories()
    logger.info("✅ Backend server started")

@app.on_event("shutdown")
async def shutdown_event():
    await close_db_connection()
    logger.info("🛑 Backend server stopped")
