// Mock data za kviz aplikaciju

export const mockCategories = [
  { id: '1', name: 'Istorija', icon: '📜', color: '#FFE66D', quizCount: 15 },
  { id: '2', name: 'Srpski Jezik', icon: '📖', color: '#C7CEEA', quizCount: 18 },
  { id: '3', name: 'Geografija', icon: '🌍', color: '#95E1D3', quizCount: 12 },
  { id: '4', name: 'Matematika', icon: '🔢', color: '#FF6B6B', quizCount: 20 },
  { id: '5', name: 'Biologija', icon: '🧬', color: '#A8E6CF', quizCount: 14 },
  { id: '6', name: 'Informatika', icon: '💻', color: '#FFDAB9', quizCount: 22 },
  { id: '7', name: 'Fizika', icon: '⚛️', color: '#B4A7D6', quizCount: 16 },
  { id: '8', name: 'Hemija', icon: '🔬', color: '#4ECDC4', quizCount: 13 }
];

export const mockQuizzes = [
  {
    id: '1',
    title: 'Osnove Algebre',
    description: 'Testirajte svoje veštine algebre sa osnovnim jednačinama',
    categoryId: '4',
    difficulty: 'Lako',
    questionCount: 10,
    timeLimit: 15,
    plays: 1250,
    rating: 4.5,
    createdBy: 'Prof. Marković'
  },
  {
    id: '2',
    title: 'Osnove Hemije',
    description: 'Istražite periodnu tabelu i hemijske reakcije',
    categoryId: '8',
    difficulty: 'Srednje',
    questionCount: 15,
    timeLimit: 20,
    plays: 890,
    rating: 4.7,
    createdBy: 'Dr. Jovanović'
  },
  {
    id: '3',
    title: 'Istorija Srbije',
    description: 'Testirajte svoje znanje o istoriji Srbije',
    categoryId: '1',
    difficulty: 'Teško',
    questionCount: 20,
    timeLimit: 25,
    plays: 650,
    rating: 4.8,
    createdBy: 'Prof. Petrović'
  },
  {
    id: '4',
    title: 'Glavni Gradovi Sveta',
    description: 'Koliko dobro poznajete glavne gradove?',
    categoryId: '3',
    difficulty: 'Srednje',
    questionCount: 12,
    timeLimit: 18,
    plays: 2100,
    rating: 4.6,
    createdBy: 'Nastavnik Nikolić'
  },
  {
    id: '5',
    title: 'Python Osnove',
    description: 'Započnite svoje programersko putovanje sa Python-om',
    categoryId: '6',
    difficulty: 'Lako',
    questionCount: 10,
    timeLimit: 15,
    plays: 3200,
    rating: 4.9,
    createdBy: 'CodeMaster'
  },
  {
    id: '6',
    title: 'Srpska Književnost',
    description: 'Koliko poznajete klasike srpske književnosti?',
    categoryId: '2',
    difficulty: 'Srednje',
    questionCount: 15,
    timeLimit: 20,
    plays: 1450,
    rating: 4.6,
    createdBy: 'Prof. Stanković'
  },
  {
    id: '7',
    title: 'Životinji Svet',
    description: 'Testirajte svoje znanje o životinjama i ekosistemima',
    categoryId: '5',
    difficulty: 'Lako',
    questionCount: 12,
    timeLimit: 15,
    plays: 1820,
    rating: 4.7,
    createdBy: 'Dr. Simić'
  },
  {
    id: '8',
    title: 'Njutnovi Zakoni',
    description: 'Razumite osnovne principe fizike',
    categoryId: '7',
    difficulty: 'Teško',
    questionCount: 18,
    timeLimit: 25,
    plays: 980,
    rating: 4.8,
    createdBy: 'Prof. Nikolić'
  }
];

export const mockQuestions = {
  '1': [
    {
      id: 'q1',
      type: 'multiple',
      question: 'Kolika je vrednost x u jednačini 2x + 5 = 15?',
      options: ['3', '5', '7', '10'],
      correctAnswer: 1
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'Kvadratni koren iz 144 je 12.',
      correctAnswer: true
    },
    {
      id: 'q3',
      type: 'multiple',
      question: 'Koji od sledećih brojeva je prost broj?',
      options: ['12', '15', '17', '21'],
      correctAnswer: 2
    }
  ],
  '5': [
    {
      id: 'q1',
      type: 'multiple',
      question: 'Koja ključna reč se koristi za definisanje funkcije u Python-u?',
      options: ['func', 'def', 'function', 'define'],
      correctAnswer: 1
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'Python je kompajlirani jezik.',
      correctAnswer: false
    }
  ]
};

export const mockLeaderboard = [
  { id: '1', username: 'KvizMajstor3000', score: 9850, quizzesCompleted: 45, avatar: '🏆' },
  { id: '2', username: 'PametniBob', score: 8920, quizzesCompleted: 41, avatar: '🧠' },
  { id: '3', username: 'PametnaSara', score: 8450, quizzesCompleted: 38, avatar: '⭐' },
  { id: '4', username: 'EinsteinJr', score: 7890, quizzesCompleted: 35, avatar: '🎓' },
  { id: '5', username: 'KraljZnanja', score: 7320, quizzesCompleted: 32, avatar: '👑' },
  { id: '6', username: 'DrugZaUčenje', score: 6850, quizzesCompleted: 30, avatar: '📖' },
  { id: '7', username: 'KvizČarobnjak', score: 6420, quizzesCompleted: 28, avatar: '⚡' },
  { id: '8', username: 'TestMajstor', score: 5990, quizzesCompleted: 26, avatar: '✨' },
  { id: '9', username: 'ProUčenik', score: 5560, quizzesCompleted: 24, avatar: '🎯' },
  { id: '10', username: 'TragačČinjenica', score: 5120, quizzesCompleted: 22, avatar: '🔍' }
];

export const mockUserProgress = {
  totalQuizzes: 12,
  totalScore: 4580,
  averageScore: 85,
  rank: 156,
  badges: [
    { id: '1', name: 'Prvi Kviz', icon: '🎯', earned: true },
    { id: '2', name: 'Savršen Rezultat', icon: '💯', earned: true },
    { id: '3', name: '10 Kvizova', icon: '🔟', earned: true },
    { id: '4', name: 'Brzinski Demon', icon: '⚡', earned: false },
    { id: '5', name: 'Majstor Kategorije', icon: '👑', earned: false }
  ],
  recentActivity: [
    { quizTitle: 'Python Osnove', score: 90, date: 'pre 2 sata' },
    { quizTitle: 'Osnove Algebre', score: 85, date: 'pre 1 dan' },
    { quizTitle: 'Glavni Gradovi', score: 95, date: 'pre 2 dana' }
  ]
};

// Mock korisnik za autentifikaciju
export let mockCurrentUser = null;

export const mockLogin = (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockCurrentUser = {
        id: 'user1',
        email: email,
        username: 'DemoKorisnik',
        avatar: '👤',
        isAdmin: email === 'admin@quiz.com'
      };
      localStorage.setItem('mockUser', JSON.stringify(mockCurrentUser));
      resolve(mockCurrentUser);
    }, 500);
  });
};

export const mockSignup = (email, username, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockCurrentUser = {
        id: 'user_' + Date.now(),
        email: email,
        username: username,
        avatar: '👤',
        isAdmin: false
      };
      localStorage.setItem('mockUser', JSON.stringify(mockCurrentUser));
      resolve(mockCurrentUser);
    }, 500);
  });
};

export const mockLogout = () => {
  mockCurrentUser = null;
  localStorage.removeItem('mockUser');
};

export const getMockCurrentUser = () => {
  const stored = localStorage.getItem('mockUser');
  if (stored) {
    mockCurrentUser = JSON.parse(stored);
    return mockCurrentUser;
  }
  return null;
};

export const mockSubmitQuiz = (quizId, answers) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const correctCount = Math.floor(Math.random() * 3) + answers.length - 2;
      const score = Math.round((correctCount / answers.length) * 100);
      resolve({
        score,
        correctCount,
        totalQuestions: answers.length,
        passed: score >= 70
      });
    }, 1000);
  });
};

export const mockCreateQuiz = (quizData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newQuiz = {
        id: 'quiz_' + Date.now(),
        ...quizData,
        plays: 0,
        rating: 0,
        createdBy: mockCurrentUser?.username || 'Anonimno'
      };
      resolve(newQuiz);
    }, 500);
  });
};