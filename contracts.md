# API Ugovori i Integracija - KvizMajstor

## 1. MOCK PODACI ZA ZAMENU

### Mock funkcije u `/frontend/src/utils/mock.js`:
- `mockLogin(email, password)` → API poziv za autentifikaciju
- `mockSignup(email, username, password)` → API poziv za registraciju
- `mockLogout()` → API poziv za odjavu
- `mockSubmitQuiz(quizId, answers)` → API poziv za podnošenje kviza
- `mockCreateQuiz(quizData)` → API poziv za kreiranje kviza
- `getMockCurrentUser()` → API poziv za trenutnog korisnika

### Mock podaci:
- `mockCategories` → GET /api/categories
- `mockQuizzes` → GET /api/quizzes
- `mockQuestions` → GET /api/quizzes/:id/questions
- `mockLeaderboard` → GET /api/leaderboard
- `mockUserProgress` → GET /api/users/progress

---

## 2. BACKEND API ENDPOINTS

### Autentifikacija
```
POST   /api/auth/signup
Body:  { email, username, password }
Response: { user, token }

POST   /api/auth/login
Body:  { email, password }
Response: { user, token }

POST   /api/auth/logout
Response: { message }

GET    /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user }
```

### Kategorije
```
GET    /api/categories
Response: [{ id, name, icon, color, quizCount }]
```

### Kvizovi
```
GET    /api/quizzes
Query: ?categoryId=&difficulty=&search=
Response: [{ id, title, description, categoryId, difficulty, questionCount, timeLimit, plays, rating, createdBy }]

GET    /api/quizzes/:id
Response: { id, title, description, categoryId, difficulty, questionCount, timeLimit, plays, rating, createdBy }

GET    /api/quizzes/:id/questions
Response: [{ id, type, question, options, correctAnswer }]

POST   /api/quizzes
Headers: { Authorization: Bearer <token> }
Body: { title, description, categoryId, difficulty, timeLimit, questions }
Response: { quiz }

POST   /api/quizzes/:id/submit
Headers: { Authorization: Bearer <token> }
Body: { answers: [{ questionId, answer }] }
Response: { score, correctCount, totalQuestions, passed }
```

### Rang Lista
```
GET    /api/leaderboard
Response: [{ id, username, score, quizzesCompleted, avatar }]
```

### Korisnik
```
GET    /api/users/progress
Headers: { Authorization: Bearer <token> }
Response: { totalQuizzes, totalScore, averageScore, rank, badges, recentActivity }

GET    /api/users/profile
Headers: { Authorization: Bearer <token> }
Response: { user, stats }
```

---

## 3. MONGODB MODELI

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique),
  username: String (unique),
  password: String (hashed),
  avatar: String,
  isAdmin: Boolean,
  totalScore: Number,
  quizzesCompleted: Number,
  badges: [String],
  createdAt: Date
}
```

### Category Model
```javascript
{
  _id: ObjectId,
  name: String,
  icon: String,
  color: String,
  quizCount: Number
}
```

### Quiz Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  categoryId: ObjectId,
  difficulty: String,
  timeLimit: Number,
  plays: Number,
  rating: Number,
  createdBy: ObjectId,
  questions: [{
    type: String,
    question: String,
    options: [String],
    correctAnswer: Mixed
  }],
  createdAt: Date
}
```

### QuizResult Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  quizId: ObjectId,
  score: Number,
  correctCount: Number,
  totalQuestions: Number,
  passed: Boolean,
  answers: [{ questionId, answer, isCorrect }],
  completedAt: Date
}
```

---

## 4. FRONTEND INTEGRACIJA

### Fajlovi za Izmenu:
1. `/frontend/src/utils/api.js` - novi fajl za API pozive
2. `/frontend/src/context/AuthContext.js` - zameniti mock sa API
3. `/frontend/src/pages/QuizzesPage.js` - fetch kvizovi iz API
4. `/frontend/src/pages/QuizTakePage.js` - fetch pitanja iz API
5. `/frontend/src/pages/LeaderboardPage.js` - fetch rang lista iz API
6. `/frontend/src/pages/ProfilePage.js` - fetch user progress iz API
7. `/frontend/src/pages/CreateQuizPage.js` - POST novi kviz

### AuthContext izmene:
- Dodati JWT token storage u localStorage
- API pozivi umesto mock funkcija
- Axios interceptor za automatsko dodavanje tokena

---

## 5. IMPLEMENTACIONI PLAN

### FAZA 1: Backend Setup
1. Kreirati MongoDB modele
2. Implementirati auth endpoints (signup, login, logout, me)
3. JWT token generisanje i verifikacija
4. Password hashing sa bcrypt

### FAZA 2: CRUD Operacije
1. Categories CRUD
2. Quizzes CRUD
3. Quiz submission i evaluacija
4. Leaderboard kalkulacija
5. User progress tracking

### FAZA 3: Frontend Integracija
1. Kreirati api.js utility
2. Zameniti mock u AuthContext
3. Zameniti mock u svim pages
4. Testiranje kompletnog flowa

### FAZA 4: Dodatne Funkcionalnosti
1. Validacija podataka
2. Error handling
3. Loading states
4. Toast notifikacije za greške
