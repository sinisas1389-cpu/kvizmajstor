import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { categoriesAPI, quizzesAPI } from '../utils/api';
import { mockCategories, mockCreateQuiz } from '../utils/mock';

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    categoryId: '',
    difficulty: 'Lako',
    timeLimit: 15,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Greška pri učitavanju kategorija:', error);
        // Fallback to mock data if API fails
        setCategories(mockCategories);
      }
    };
    fetchCategories();
  }, []);

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast({ title: 'Molimo unesite pitanje!', variant: 'destructive' });
      return;
    }

    if (currentQuestion.type === 'multiple') {
      const validOptions = currentQuestion.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast({ title: 'Molimo dodajte najmanje 2 opcije!', variant: 'destructive' });
        return;
      }
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: 'q' + Date.now() }]
    }));

    setCurrentQuestion({
      type: 'multiple',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });

    toast({ title: 'Pitanje uspešno dodato! ✨' });
  };

  const removeQuestion = (idx) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Molimo prijavite se da biste kreirali kviz!', variant: 'destructive' });
      return;
    }

    if (!quizData.title || !quizData.description || !quizData.categoryId) {
      toast({ title: 'Molimo popunite sva obavezna polja!', variant: 'destructive' });
      return;
    }

    if (quizData.questions.length < 3) {
      toast({ title: 'Molimo dodajte najmanje 3 pitanja!', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const newQuiz = await quizzesAPI.create({
        ...quizData,
        questionCount: quizData.questions.length
      });

      toast({ title: 'Kviz uspešno kreiran! 🎉' });
      navigate('/quizzes');
    } catch (error) {
      console.error('Greška pri kreiranju kviza:', error);
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.detail || 'Došlo je do greške pri kreiranju kviza',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
              Create Quiz ✨
            </span>
          </h1>
          <p className="text-xl text-gray-600 font-medium">Share your knowledge with the world!</p>
        </div>

        {/* Quiz Info */}
        <Card className="border-4 border-blue-300 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
            <CardTitle className="text-3xl font-black">Quiz Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div>
              <Label className="text-lg font-bold mb-2 block">Quiz Title *</Label>
              <Input
                placeholder="e.g., Advanced JavaScript Challenge"
                value={quizData.title}
                onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg p-6 border-2 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-lg font-bold mb-2 block">Description *</Label>
              <Textarea
                placeholder="Describe what this quiz is about..."
                value={quizData.description}
                onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                className="text-lg p-6 border-2 rounded-xl min-h-24"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label className="text-lg font-bold mb-2 block">Category *</Label>
                <Select
                  value={quizData.categoryId}
                  onValueChange={(value) => setQuizData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="text-lg p-6 border-2 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="text-lg">
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-lg font-bold mb-2 block">Difficulty</Label>
                <Select
                  value={quizData.difficulty}
                  onValueChange={(value) => setQuizData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="text-lg p-6 border-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lako" className="text-lg">Lako</SelectItem>
                    <SelectItem value="Srednje" className="text-lg">Srednje</SelectItem>
                    <SelectItem value="Teško" className="text-lg">Teško</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-lg font-bold mb-2 block">Time Limit (minutes)</Label>
                <Input
                  type="number"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                  className="text-lg p-6 border-2 rounded-xl"
                  min="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Question */}
        <Card className="border-4 border-green-300 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100">
            <CardTitle className="text-3xl font-black">Add Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div>
              <Label className="text-lg font-bold mb-2 block">Question Type</Label>
              <Select
                value={currentQuestion.type}
                onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="text-lg p-6 border-2 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple" className="text-lg">Multiple Choice</SelectItem>
                  <SelectItem value="true-false" className="text-lg">True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-bold mb-2 block">Question</Label>
              <Textarea
                placeholder="Enter your question here..."
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                className="text-lg p-6 border-2 rounded-xl min-h-24"
              />
            </div>

            {currentQuestion.type === 'multiple' ? (
              <div>
                <Label className="text-lg font-bold mb-2 block">Options</Label>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === idx}
                        onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                        className="w-6 h-6"
                      />
                      <Input
                        placeholder={`Option ${idx + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[idx] = e.target.value;
                          setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="text-lg p-4 border-2 rounded-xl"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2 font-medium">Select the correct answer</p>
              </div>
            ) : (
              <div>
                <Label className="text-lg font-bold mb-2 block">Correct Answer</Label>
                <Select
                  value={currentQuestion.correctAnswer.toString()}
                  onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: value === 'true' }))}
                >
                  <SelectTrigger className="text-lg p-6 border-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="text-lg">True</SelectItem>
                    <SelectItem value="false" className="text-lg">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={addQuestion}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-6 text-lg font-bold rounded-xl"
            >
              <Plus className="mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}
        {quizData.questions.length > 0 && (
          <Card className="border-4 border-purple-300 shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
              <CardTitle className="text-3xl font-black">
                Questions ({quizData.questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {quizData.questions.map((q, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-6 bg-white rounded-xl border-2 border-gray-200">
                    <div className="flex-1">
                      <p className="font-black text-gray-800 mb-2">Q{idx + 1}. {q.question}</p>
                      <p className="text-sm text-gray-500 font-medium">
                        Type: {q.type === 'multiple' ? 'Multiple Choice' : 'True/False'}
                      </p>
                    </div>
                    <Button
                      onClick={() => removeQuestion(idx)}
                      variant="destructive"
                      size="sm"
                      className="font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/quizzes')}
            variant="outline"
            className="flex-1 py-6 text-lg font-bold rounded-xl border-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-6 text-lg font-bold rounded-xl"
          >
            <Sparkles className="mr-2" />
            Create Quiz!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage;