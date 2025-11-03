from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any
from datetime import datetime
import uuid

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    password: str
    avatar: str = "👤"
    isAdmin: bool = False
    isCreator: bool = False  # Nova privilegija za kreiranje kvizova
    totalScore: int = 0
    quizzesCompleted: int = 0
    badges: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "korisnik@example.com",
                "username": "KorisnikTest",
                "avatar": "👤"
            }
        }

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    avatar: str
    isAdmin: bool
    totalScore: int
    quizzesCompleted: int

# Category Models
class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    color: str
    quizCount: int = 0

# Quiz Models
class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # "multiple" or "true-false"
    question: str
    options: Optional[List[str]] = None
    correctAnswer: Any
    youtubeUrl: Optional[str] = None  # YouTube link za dodatnu lekciju
    explanation: Optional[str] = None  # Objašnjenje odgovora

class QuizCreate(BaseModel):
    title: str
    description: str
    categoryId: str
    difficulty: str
    timeLimit: int
    questions: List[QuizQuestion]

class Quiz(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    categoryId: str
    difficulty: str
    questionCount: int
    timeLimit: int
    plays: int = 0
    rating: float = 0.0
    createdBy: str
    questions: List[QuizQuestion]
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class QuizResponse(BaseModel):
    id: str
    title: str
    description: str
    categoryId: str
    difficulty: str
    questionCount: int
    timeLimit: int
    plays: int
    rating: float
    createdBy: str

# Quiz Submission
class QuizAnswer(BaseModel):
    questionId: str
    answer: Any

class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]

class QuizResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    quizId: str
    score: int
    correctCount: int
    totalQuestions: int
    passed: bool
    completedAt: datetime = Field(default_factory=datetime.utcnow)

class QuizResultResponse(BaseModel):
    score: int
    correctCount: int
    totalQuestions: int
    passed: bool

# Leaderboard
class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    quizzesCompleted: int
    avatar: str

# User Progress
class Badge(BaseModel):
    id: str
    name: str
    icon: str
    earned: bool

class RecentActivity(BaseModel):
    quizTitle: str
    score: int
    date: str

class UserProgress(BaseModel):
    totalQuizzes: int
    totalScore: int
    averageScore: int
    rank: int
    badges: List[Badge]
    recentActivity: List[RecentActivity]