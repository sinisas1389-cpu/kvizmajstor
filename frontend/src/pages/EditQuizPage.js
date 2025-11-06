import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { categoriesAPI, quizzesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';
import { Trash2, Plus, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

const EditQuizPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    categoryId: '',
    timeLimit: 0,
    timeLimitPerQuestion: 0,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    youtubeUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    fetchCategories();
    fetchQuiz();
  }, [isAuthenticated, quizId]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Greška pri učitavanju kategorija:', error);
    }
  };

  const fetchQuiz = async () => {
    try {
      const quiz = await quizzesAPI.getById(quizId);
      const questions = await quizzesAPI.getQuestions(quizId);
      
      setQuizData({
        title: quiz.title,
        description: quiz.description,
        categoryId: quiz.categoryId,
        timeLimit: quiz.timeLimit || 0,
        timeLimitPerQuestion: quiz.timeLimitPerQuestion || 0,
        questions: questions
      });
      
    } catch (error) {
      console.error('Greška pri učitavanju kviza:', error);
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

  const removeQuestion = (idx) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast({ title: 'Unesite pitanje', variant: 'destructive' });
      return;
    }

    if (currentQuestion.type === 'multiple') {
      const filledOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
      if (filledOptions.length < 2) {
        toast({ title: 'Unesite najmanje 2 opcije', variant: 'destructive' });
        return;
      }
      if (!currentQuestion.correctAnswer) {
        toast({ title: 'Izaberite tačan odgovor', variant: 'destructive' });
        return;
      }
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    setCurrentQuestion({
      question: '',
      type: 'multiple',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      youtubeUrl: '',
      imageUrl: ''
    });

    toast({ title: 'Pitanje dodato! ✅' });
  };

  const handleSubmit = async () => {
    if (!quizData.title || !quizData.description || !quizData.categoryId) {
      toast({ title: 'Popunite sva obavezna polja', variant: 'destructive' });
      return;
    }

    if (quizData.questions.length < 3) {
      toast({ title: 'Dodajte najmanje 3 pitanja', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await quizzesAPI.update(quizId, quizData);
      toast({ title: 'Kviz uspešno ažuriran! 🎉' });
      navigate('/quizzes');
    } catch (error) {
      console.error('Greška:', error);
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.detail || 'Nije moguće ažurirati kviz',
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    console.log('📁 Excel file selected:', file);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        console.log('📖 Reading Excel file...');
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('📊 Parsed Excel data:', jsonData);

        const questions = [];
        
        console.log('📊 Total rows in Excel:', jsonData.length);
        
        jsonData.forEach((row, idx) => {
          const type = (row['Tip'] || row['Type'] || '').toLowerCase();
          const question = row['Pitanje'] || row['Question'] || '';
          
          console.log(`Row ${idx + 1}:`, { type, question, row });
          
          if (!question.trim()) {
            console.warn(`⚠️ Row ${idx + 1}: Pitanje is empty, skipping`);
            return;
          }

          if (type === 'multiple' || type === 'multiple-choice') {
            const correctAnswerNum = parseInt(row['TačanOdgovor'] || row['CorrectAnswer'] || '0');
            const correctAnswerIndex = correctAnswerNum - 1;
            const correctAnswerStr = correctAnswerIndex.toString().toLowerCase();
            
            questions.push({
              question: question,
              type: 'multiple',
              options: [
                row['Opcija1'] || row['Option1'] || '',
                row['Opcija2'] || row['Option2'] || '',
                row['Opcija3'] || row['Option3'] || '',
                row['Opcija4'] || row['Option4'] || ''
              ],
              correctAnswer: correctAnswerStr,
              explanation: row['Objašnjenje'] || row['Explanation'] || '',
              youtubeUrl: row['YouTubeURL'] || row['YoutubeURL'] || '',
              imageUrl: row['SlikaURL'] || row['ImageURL'] || ''
            });
          }
        });

        console.log('✅ Parsed questions:', questions);
        
        if (questions.length === 0) {
          console.error('❌ No valid questions found');
          toast({ 
            title: 'Greška', 
            description: 'Nisu pronađena validna pitanja u Excel fajlu. Proverite format.',
            variant: 'destructive'
          });
          return;
        }

        console.log(`✅ Adding ${questions.length} questions to quiz`);
        
        setQuizData(prev => ({
          ...prev,
          questions: [...prev.questions, ...questions]
        }));

        toast({ 
          title: `Uspešno dodato ${questions.length} pitanja! 🎉`,
          description: 'Proverite listu pitanja ispod'
        });

      } catch (error) {
        console.error('Greška pri parsiranju Excel fajla:', error);
        toast({ 
          title: 'Greška', 
          description: 'Problem sa čitanjem Excel fajla. Proverite format.',
          variant: 'destructive'
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl font-bold">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-center mb-12">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Uredi Kviz ✏️
          </span>
        </h1>

        {/* Quiz Information */}
        <Card className="border-4 border-purple-300 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
            <CardTitle className="text-3xl font-black">Osnovne Informacije</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div>
              <Label className="font-bold mb-2 block">Naslov Kviza (*)</Label>
              <Input
                placeholder="npr. Napredni JavaScript"
                value={quizData.title}
                onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                className="border-2 border-purple-300 text-lg"
              />
            </div>

            <div>
              <Label className="font-bold mb-2 block">Opis (*)</Label>
              <Textarea
                placeholder="Opišite kratak sadržaj kviza..."
                value={quizData.description}
                onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                className="border-2 border-purple-300"
                rows={3}
              />
            </div>

            <div>
              <Label className="font-bold mb-2 block">Kategorija (*)</Label>
              <Select value={quizData.categoryId} onValueChange={(value) => setQuizData(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger className="border-2 border-purple-300">
                  <SelectValue placeholder="Izaberite kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold mb-2 block">Ukupno Vreme (minuti)</Label>
                <Input
                  type="number"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData({...quizData, timeLimit: parseInt(e.target.value) || 0})}
                  className="border-2 border-purple-300"
                  min={0}
                />
              </div>

              <div>
                <Label className="font-bold mb-2 block">Vreme po Pitanju (sekundi)</Label>
                <Input
                  type="number"
                  value={quizData.timeLimitPerQuestion}
                  onChange={(e) => setQuizData({...quizData, timeLimitPerQuestion: parseInt(e.target.value) || 0})}
                  className="border-2 border-purple-300"
                  min={0}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Questions - Excel Upload */}
        <Card className="border-4 border-green-400 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-green-100 to-teal-100 flex flex-row items-center justify-between">
            <CardTitle className="text-3xl font-black">Dodaj Pitanja</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // Download template logic
                  const template = [
                    { Tip: 'multiple', Pitanje: 'Koliko je 2+2?', Opcija1: '3', Opcija2: '4', Opcija3: '5', Opcija4: '6', TačanOdgovor: 2, SlikaURL: '', YouTubeURL: '', Objašnjenje: 'Osnovna matematika: 2+2=4' }
                  ];
                  const ws = XLSX.utils.json_to_sheet(template);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Pitanja');
                  XLSX.writeFile(wb, 'kviz_template.xlsx');
                }}
                variant="outline"
                className="bg-green-500 text-white hover:bg-green-600 font-bold border-2 border-green-600"
              >
                <Download className="mr-2 w-4 h-4" />
                Preuzmi Template
              </Button>
              <label>
                <Button
                  as="span"
                  className="bg-blue-500 text-white hover:bg-blue-600 font-bold"
                >
                  <Upload className="mr-2 w-4 h-4" />
                  Učitaj Excel
                </Button>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Manual question input - similar to CreateQuizPage */}
            <div>
              <Label className="font-bold mb-2 block">Pitanje (*)</Label>
              <Textarea
                placeholder="Unesite pitanje..."
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                className="border-2 border-green-300"
                rows={2}
              />
            </div>

            <div>
              <Label className="font-bold mb-2 block">Tip Pitanja (*)</Label>
              <Select 
                value={currentQuestion.type} 
                onValueChange={(value) => {
                  setCurrentQuestion({
                    ...currentQuestion, 
                    type: value,
                    correctAnswer: value === 'true-false' ? 'true' : ''
                  });
                }}
              >
                <SelectTrigger className="border-2 border-green-300">
                  <SelectValue placeholder="Izaberite tip pitanja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple">Višestruki izbor (Multiple Choice)</SelectItem>
                  <SelectItem value="true-false">Tačno/Netačno (True/False)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentQuestion.type === 'multiple' && (
              <div className="grid md:grid-cols-2 gap-4">
                {currentQuestion.options.map((opt, idx) => (
                  <div key={idx}>
                    <Label className="font-bold mb-2 block">Opcija {idx + 1}</Label>
                    <Input
                      placeholder={`Opcija ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[idx] = e.target.value;
                        setCurrentQuestion({...currentQuestion, options: newOptions});
                      }}
                      className="border-2 border-green-300"
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label className="font-bold mb-2 block">Tačan Odgovor (*)</Label>
              <Select value={currentQuestion.correctAnswer} onValueChange={(value) => setCurrentQuestion({...currentQuestion, correctAnswer: value})}>
                <SelectTrigger className="border-2 border-green-300">
                  <SelectValue placeholder="Izaberite tačan odgovor" />
                </SelectTrigger>
                <SelectContent>
                  {currentQuestion.options.map((opt, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      Opcija {idx + 1}: {opt || '(prazno)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={addQuestion}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 text-lg"
            >
              <Plus className="mr-2 w-5 h-5" />
              Dodaj Pitanje
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}
        {quizData.questions.length > 0 && (
          <Card className="border-4 border-orange-400 shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
              <CardTitle className="text-3xl font-black">Pitanja ({quizData.questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {quizData.questions.map((q, idx) => (
                  <Card key={idx} className="border-2 border-orange-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-lg mb-2">{idx + 1}. {q.question}</p>
                          {q.options && (
                            <ul className="ml-4 text-sm space-y-1">
                              {q.options.map((opt, optIdx) => (
                                <li key={optIdx} className={optIdx.toString() === q.correctAnswer ? 'text-green-600 font-bold' : ''}>
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                  {optIdx.toString() === q.correctAnswer && ' ✓'}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <Button
                          onClick={() => removeQuestion(idx)}
                          variant="destructive"
                          size="sm"
                          className="ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/quizzes')}
            variant="outline"
            className="flex-1 py-6 text-lg font-bold border-2"
          >
            Otkaži
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg font-bold"
          >
            {submitting ? 'Čuvanje...' : 'Sačuvaj Izmene'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditQuizPage;
