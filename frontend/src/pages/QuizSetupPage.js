import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { quizzesAPI, categoriesAPI } from '../utils/api';
import { Clock, Zap, Infinity, Play } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const QuizSetupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeMode, setTimeMode] = useState('default'); // default, custom, unlimited
  const [customTimeLimit, setCustomTimeLimit] = useState(15);
  const [customTimePerQuestion, setCustomTimePerQuestion] = useState(30);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      console.log('📥 Fetching quiz:', id);
      const quizData = await quizzesAPI.getById(id);
      console.log('✅ Quiz loaded:', quizData);
      
      setQuiz(quizData);
      setCustomTimeLimit(quizData.timeLimit || 15);
      setCustomTimePerQuestion(quizData.timeLimitPerQuestion || 30);
      
      // Fetch category
      const categories = await categoriesAPI.getAll();
      const cat = categories.find(c => c.id === quizData.categoryId);
      setCategory(cat);
      
    } catch (error) {
      console.error('❌ Error fetching quiz:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće učitati kviz',
        variant: 'destructive'
      });
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    let finalTimeLimit = 0;
    let finalTimePerQuestion = 0;

    if (timeMode === 'default') {
      finalTimeLimit = quiz.timeLimit;
      finalTimePerQuestion = quiz.timeLimitPerQuestion;
    } else if (timeMode === 'custom') {
      finalTimeLimit = customTimeLimit;
      finalTimePerQuestion = customTimePerQuestion;
    } else if (timeMode === 'unlimited') {
      finalTimeLimit = 0;
      finalTimePerQuestion = 0;
    }

    navigate(`/quiz/${id}/take`, {
      state: {
        timeLimit: finalTimeLimit,
        timeLimitPerQuestion: finalTimePerQuestion
      }
    });
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <p className="text-2xl font-bold">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all"
                 style={{ backgroundColor: category?.color }}>
              <span className="text-5xl">{category?.icon}</span>
            </div>
          </div>
          <h1 className="text-5xl font-black mb-4 text-gray-800">
            {quiz.title}
          </h1>
          <p className="text-xl text-gray-600 font-medium mb-4">{quiz.description}</p>
          <div className="flex gap-4 justify-center text-sm font-bold">
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
              📝 {quiz.questionCount} pitanja
            </span>
            <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
              ⭐ {quiz.rating} ocena
            </span>
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
              🎮 {quiz.plays} igranja
            </span>
          </div>
        </div>

        {/* Time Settings */}
        <Card className="border-4 border-purple-400 shadow-2xl mb-8">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
            <CardTitle className="text-3xl font-black flex items-center gap-2">
              <Clock className="w-8 h-8" />
              Podesi Vremensko Ograničenje ⏱️
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-lg text-gray-600 font-medium mb-6">
              Izaberi kako želiš da polaže\u0161 ovaj kviz:
            </p>

            {/* Default Time */}
            <div
              onClick={() => setTimeMode('default')}
              className={`p-6 rounded-2xl border-4 mb-4 cursor-pointer transition-all transform hover:scale-102 ${
                timeMode === 'default'
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-500 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-800 mb-1">
                    Standardno Vreme (Preporučeno)
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {quiz.timeLimit > 0 ? `${quiz.timeLimit} minuta ukupno` : 'Bez ukupnog limita'}
                    {quiz.timeLimitPerQuestion > 0 && ` • ${quiz.timeLimitPerQuestion} sekundi po pitanju`}
                    {quiz.timeLimit === 0 && quiz.timeLimitPerQuestion === 0 && ' • Bez vremenskog ograničenja'}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Time */}
            <div
              onClick={() => setTimeMode('custom')}
              className={`p-6 rounded-2xl border-4 mb-4 cursor-pointer transition-all transform hover:scale-102 ${
                timeMode === 'custom'
                  ? 'bg-gradient-to-r from-orange-100 to-pink-100 border-orange-500 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-orange-400'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-800 mb-1">
                    Prilagođeno Vreme
                  </h3>
                  <p className="text-gray-600 font-medium">
                    Postavi svoje vremensko ograničenje
                  </p>
                </div>
              </div>
              
              {timeMode === 'custom' && (
                <div className="grid md:grid-cols-2 gap-4 mt-4 pl-20">
                  <div>
                    <Label className="font-bold mb-2 block">Ukupno Vreme (minute)</Label>
                    <Input
                      type="number"
                      value={customTimeLimit}
                      onChange={(e) => setCustomTimeLimit(parseInt(e.target.value) || 0)}
                      className="border-2 border-orange-300"
                      min="0"
                      placeholder="0 = bez limita"
                    />
                  </div>
                  <div>
                    <Label className="font-bold mb-2 block">Vreme po Pitanju (sekunde)</Label>
                    <Input
                      type="number"
                      value={customTimePerQuestion}
                      onChange={(e) => setCustomTimePerQuestion(parseInt(e.target.value) || 0)}
                      className="border-2 border-orange-300"
                      min="0"
                      placeholder="0 = bez limita"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Unlimited Time */}
            <div
              onClick={() => setTimeMode('unlimited')}
              className={`p-6 rounded-2xl border-4 cursor-pointer transition-all transform hover:scale-102 ${
                timeMode === 'unlimited'
                  ? 'bg-gradient-to-r from-green-100 to-blue-100 border-green-500 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-green-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <Infinity className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-800 mb-1">
                    Bez Vremenskog Ograničenja
                  </h3>
                  <p className="text-gray-600 font-medium">
                    Razmišljaj koliko god želiš - idealno za učenje
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/quizzes')}
            variant="outline"
            className="flex-1 py-6 text-lg font-bold rounded-xl border-2"
          >
            ← Nazad
          </Button>
          <Button
            onClick={handleStartQuiz}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg font-bold rounded-xl"
          >
            <Play className="mr-2" />
            Počni Kviz!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizSetupPage;
