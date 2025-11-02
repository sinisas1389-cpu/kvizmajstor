// Mock data for quiz application

export const mockCategories = [
  { id: '1', name: 'Mathematics', icon: '🔢', color: '#FF6B6B', quizCount: 12 },
  { id: '2', name: 'Science', icon: '🔬', color: '#4ECDC4', quizCount: 15 },
  { id: '3', name: 'History', icon: '📜', color: '#FFE66D', quizCount: 10 },
  { id: '4', name: 'Geography', icon: '🌍', color: '#95E1D3', quizCount: 8 },
  { id: '5', name: 'Literature', icon: '📚', color: '#C7CEEA', quizCount: 11 },
  { id: '6', name: 'Programming', icon: '💻', color: '#FFDAB9', quizCount: 20 }
];

export const mockQuizzes = [
  {
    id: '1',
    title: 'Basic Algebra Challenge',
    description: 'Test your algebra skills with fundamental equations',
    categoryId: '1',
    difficulty: 'Easy',
    questionCount: 10,
    timeLimit: 15,
    plays: 1250,
    rating: 4.5,
    createdBy: 'Prof. Smith'
  },
  {
    id: '2',
    title: 'Chemistry Fundamentals',
    description: 'Explore the periodic table and chemical reactions',
    categoryId: '2',
    difficulty: 'Medium',
    questionCount: 15,
    timeLimit: 20,
    plays: 890,
    rating: 4.7,
    createdBy: 'Dr. Johnson'
  },
  {
    id: '3',
    title: 'World War II Quiz',
    description: 'Test your knowledge of WWII events and figures',
    categoryId: '3',
    difficulty: 'Hard',
    questionCount: 20,
    timeLimit: 25,
    plays: 650,
    rating: 4.8,
    createdBy: 'Prof. Williams'
  },
  {
    id: '4',
    title: 'Capital Cities Master',
    description: 'How well do you know world capitals?',
    categoryId: '4',
    difficulty: 'Medium',
    questionCount: 12,
    timeLimit: 18,
    plays: 2100,
    rating: 4.6,
    createdBy: 'Teacher Lee'
  },
  {
    id: '5',
    title: 'Python Basics',
    description: 'Start your programming journey with Python',
    categoryId: '6',
    difficulty: 'Easy',
    questionCount: 10,
    timeLimit: 15,
    plays: 3200,
    rating: 4.9,
    createdBy: 'CodeMaster'
  }
];

export const mockQuestions = {
  '1': [
    {
      id: 'q1',
      type: 'multiple',
      question: 'What is the value of x in the equation 2x + 5 = 15?',
      options: ['3', '5', '7', '10'],
      correctAnswer: 1
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'The square root of 144 is 12.',
      correctAnswer: true
    },
    {
      id: 'q3',
      type: 'multiple',
      question: 'Which of the following is a prime number?',
      options: ['12', '15', '17', '21'],
      correctAnswer: 2
    }
  ],
  '5': [
    {
      id: 'q1',
      type: 'multiple',
      question: 'What keyword is used to define a function in Python?',
      options: ['func', 'def', 'function', 'define'],
      correctAnswer: 1
    },
    {
      id: 'q2',
      type: 'true-false',
      question: 'Python is a compiled language.',
      correctAnswer: false
    }
  ]
};

export const mockLeaderboard = [
  { id: '1', username: 'QuizMaster3000', score: 9850, quizzesCompleted: 45, avatar: '🏆' },
  { id: '2', username: 'BrainiacBob', score: 8920, quizzesCompleted: 41, avatar: '🧠' },
  { id: '3', username: 'SmartySara', score: 8450, quizzesCompleted: 38, avatar: '⭐' },
  { id: '4', username: 'EinsteinJr', score: 7890, quizzesCompleted: 35, avatar: '🎓' },
  { id: '5', username: 'KnowledgeKing', score: 7320, quizzesCompleted: 32, avatar: '👑' },
  { id: '6', username: 'StudyBuddy', score: 6850, quizzesCompleted: 30, avatar: '📖' },
  { id: '7', username: 'QuizWhiz', score: 6420, quizzesCompleted: 28, avatar: '⚡' },
  { id: '8', username: 'TestTaker', score: 5990, quizzesCompleted: 26, avatar: '✨' },
  { id: '9', username: 'LearnerPro', score: 5560, quizzesCompleted: 24, avatar: '🎯' },
  { id: '10', username: 'FactFinder', score: 5120, quizzesCompleted: 22, avatar: '🔍' }
];

export const mockUserProgress = {
  totalQuizzes: 12,
  totalScore: 4580,
  averageScore: 85,
  rank: 156,
  badges: [
    { id: '1', name: 'First Quiz', icon: '🎯', earned: true },
    { id: '2', name: 'Perfect Score', icon: '💯', earned: true },
    { id: '3', name: '10 Quizzes', icon: '🔟', earned: true },
    { id: '4', name: 'Speed Demon', icon: '⚡', earned: false },
    { id: '5', name: 'Category Master', icon: '👑', earned: false }
  ],
  recentActivity: [
    { quizTitle: 'Python Basics', score: 90, date: '2 hours ago' },
    { quizTitle: 'Basic Algebra', score: 85, date: '1 day ago' },
    { quizTitle: 'Capital Cities', score: 95, date: '2 days ago' }
  ]
};

// Mock user for authentication
export let mockCurrentUser = null;

export const mockLogin = (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockCurrentUser = {
        id: 'user1',
        email: email,
        username: 'DemoUser',
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
        createdBy: mockCurrentUser?.username || 'Anonymous'
      };
      resolve(newQuiz);
    }, 500);
  });
};