import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { quizzesAPI } from '../utils/api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const QuizTakePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  
  // Koristi vreme iz location state ili default 0 (neograničeno)
  const timeLimit = location.state?.timeLimit ?? 0;
  
  const [timeLeft, setTimeLeft] = useState(timeLimit > 0 ? timeLimit * 60 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      console.log('📥 Fetching quiz for taking:', id);
      const quizData = await quizzesAPI.getById(id);
      console.log('✅ Quiz loaded:', quizData);
      
      // Fetch questions (without correct answers)
      const questionsData = await quizzesAPI.getQuestions(id);
      console.log('✅ Questions loaded:', questionsData);
      
      setQuiz(quizData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('❌ Error fetching quiz:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati kviz',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLimit > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLimit]);

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Kreiraj userAnswers objekat sa mapiranjem odgovora
      const userAnswers = questions.map((q, idx) => ({
        questionId: q.id,
        answer: answers[idx]
      }));
      
      // Submit quiz to backend - API expects { answers: [...] } format
      const result = await quizzesAPI.submit(id, userAnswers);
      
      navigate(`/quiz/${id}/result`, { 
        state: { 
          result, 
          quiz, 
          userAnswers, 
          questions 
        } 
      });
    } catch (error) {
      console.error('❌ Error submitting quiz:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće poslati odgovore',
        variant: 'destructive'
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold">Učitavanje kviza...</p>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="border-4 border-red-300">
          <CardContent className="p-12 text-center">
            <p className="text-3xl font-black text-gray-800 mb-4">Kviz nije pronađen! 😢</p>
            <Button onClick={() => navigate('/quizzes')} className="font-bold">
              Nazad na Kvizove
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border-4 border-purple-300">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-black text-gray-800">{quiz.title}</h1>
            {timeLimit > 0 && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-lg ${timeLeft < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white'}`}>
                <Clock className="w-5 h-5" />
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
            )}
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm font-bold text-gray-600 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Question Card */}
        <Card className="border-4 border-orange-300 shadow-2xl mb-8">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-pink-100">
            <CardTitle className="text-2xl font-black text-gray-800">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Slika ako postoji */}
            {currentQ.imageUrl && (
              <div className="mb-6 rounded-xl overflow-hidden border-4 border-purple-200">
                <img 
                  src={currentQ.imageUrl} 
                  alt="Pitanje slika"
                  className="w-full max-h-96 object-contain bg-gray-50"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {currentQ.type === 'multiple' ? (
              <div className="space-y-4">
                {currentQ.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-6 text-left rounded-2xl border-4 font-bold text-lg transition-all transform hover:scale-102 ${
                      answers[currentQuestion] === idx
                        ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white border-green-500 shadow-lg'
                        : 'bg-white border-gray-300 hover:border-purple-400 hover:shadow-md'
                    }`}
                  >
                    <span className="inline-block w-8 h-8 rounded-full bg-purple-500 text-white text-center leading-8 mr-4 font-black">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => handleAnswer(true)}
                  className={`w-full p-6 text-left rounded-2xl border-4 font-bold text-xl transition-all transform hover:scale-102 ${
                    answers[currentQuestion] === true
                      ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white border-green-500 shadow-lg'
                      : 'bg-white border-gray-300 hover:border-purple-400 hover:shadow-md'
                  }`}
                >
                  <CheckCircle className="inline-block mr-4 w-8 h-8" />
                  Tačno
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className={`w-full p-6 text-left rounded-2xl border-4 font-bold text-xl transition-all transform hover:scale-102 ${
                    answers[currentQuestion] === false
                      ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white border-red-500 shadow-lg'
                      : 'bg-white border-gray-300 hover:border-purple-400 hover:shadow-md'
                  }`}
                >
                  <XCircle className="inline-block mr-4 w-8 h-8" />
                  Netačno
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-8 py-6 text-lg font-bold rounded-xl"
            variant="outline"
          >
            ← Previous
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-12 py-6 text-lg font-bold rounded-xl"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz! 🎉'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-bold rounded-xl"
            >
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakePage;