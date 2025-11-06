import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import { Trash2, Sparkles, Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { categoriesAPI, quizzesAPI } from '../utils/api';
import { mockCategories, mockCreateQuiz } from '../utils/mock';
import * as XLSX from 'xlsx';

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    categoryId: '',
    timeLimit: 0,  // 0 = bez limita
    questions: []
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
      correctAnswer: 0,
      imageUrl: '',
      youtubeUrl: '',
      explanation: ''
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

  const handleExcelUpload = (e) => {
    console.log('🔥 handleExcelUpload CALLED!', e);
    const file = e.target.files[0];
    console.log('📁 Excel file selected:', file);
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

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
          // Format očekujemo: Tip | Pitanje | Opcija1 | Opcija2 | Opcija3 | Opcija4 | TačanOdgovor | YouTubeURL | Objašnjenje
          const type = (row['Tip'] || row['Type'] || '').toLowerCase();
          const question = row['Pitanje'] || row['Question'] || '';
          
          console.log(`Row ${idx + 1}:`, { type, question, row });
          
          if (!question.trim()) {
            console.warn(`⚠️ Row ${idx + 1}: Pitanje is empty, skipping`);
            return;
          }

          if (type === 'multiple' || type === 'višestruki') {
            const options = [
              row['Opcija1'] || row['Option1'] || '',
              row['Opcija2'] || row['Option2'] || '',
              row['Opcija3'] || row['Option3'] || '',
              row['Opcija4'] || row['Option4'] || ''
            ].filter(opt => opt.trim());

            const correctAnswer = parseInt(row['TačanOdgovor'] || row['CorrectAnswer'] || '1') - 1;

            questions.push({
              id: 'q' + Date.now() + idx,
              type: 'multiple',
              question: question,
              options: options,
              correctAnswer: Math.max(0, Math.min(correctAnswer, options.length - 1)),
              imageUrl: row['SlikaURL'] || row['ImageURL'] || '',
              youtubeUrl: row['YouTubeURL'] || row['YouTube'] || '',
              explanation: row['Objašnjenje'] || row['Explanation'] || ''
            });
          } else if (type === 'true-false' || type === 'tačno-netačno') {
            const correctAnswerRaw = (row['TačanOdgovor'] || row['CorrectAnswer'] || 'true').toString().toLowerCase();
            const correctAnswer = (correctAnswerRaw === 'true' || correctAnswerRaw === 'tačno' || correctAnswerRaw === '1') ? 'true' : 'false';
            
            questions.push({
              id: 'q' + Date.now() + idx,
              type: 'true-false',
              question: question,
              options: [],
              correctAnswer: correctAnswer,
              imageUrl: row['SlikaURL'] || row['ImageURL'] || '',
              youtubeUrl: row['YouTubeURL'] || row['YouTube'] || '',
              explanation: row['Objašnjenje'] || row['Explanation'] || ''
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
          title: `Uspešno učitano ${questions.length} pitanja! 📊`,
          description: 'Možete ih pregledati i izmeniti pre kreiranja kviza'
        });

      } catch (error) {
        console.error('Greška pri parsiranju Excel fajla:', error);
        toast({ 
          title: 'Greška', 
          description: 'Nije moguće učitati Excel fajl. Proverite format.',
          variant: 'destructive' 
        });
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
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
              <Label className="text-lg font-bold mb-2 block">Naslov Kviza *</Label>
              <Input
                placeholder="npr., Napredni JavaScript Izazov"
                value={quizData.title}
                onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg p-6 border-2 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-lg font-bold mb-2 block">Opis *</Label>
              <Textarea
                placeholder="Opišite o čemu je ovaj kviz..."
                value={quizData.description}
                onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                className="text-lg p-6 border-2 rounded-xl min-h-24"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg font-bold mb-2 block">Kategorija *</Label>
                <Select
                  value={quizData.categoryId}
                  onValueChange={(value) => setQuizData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="text-lg p-6 border-2 rounded-xl">
                    <SelectValue placeholder="Izaberite kategoriju" />
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
                <Label className="text-lg font-bold mb-2 block">Ukupno Vreme (minute)</Label>
                <Input
                  type="number"
                  value={quizData.timeLimit}
                  onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                  className="text-lg p-6 border-2 rounded-xl"
                  min="0"
                  placeholder="0 = bez limita"
                />
                <p className="text-sm text-gray-500 mt-1">0 = Bez vremenskog ograničenja</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Questions from Excel */}
        <Card className="border-4 border-green-300 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100">
            <CardTitle className="text-3xl font-black">Dodaj Pitanja preko Excel-a 📊</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center py-8">
              <p className="text-lg text-gray-600 font-medium mb-8">
                Preuzmite Excel template, popunite pitanja i učitajte nazad!
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  onClick={() => {
                    // Kreiranje primer Excel template-a
                    const template = [
                      {
                        'Tip': 'multiple',
                        'Pitanje': 'Koliko je 2+2?',
                        'Opcija1': '3',
                        'Opcija2': '4',
                        'Opcija3': '5',
                        'Opcija4': '6',
                        'TačanOdgovor': '2',
                        'SlikaURL': 'https://example.com/slika.jpg',
                        'YouTubeURL': '',
                        'Objašnjenje': 'Osnovna matematika: 2+2=4'
                      },
                      {
                        'Tip': 'true-false',
                        'Pitanje': 'Zemlja je okrugla.',
                        'Opcija1': '',
                        'Opcija2': '',
                        'Opcija3': '',
                        'Opcija4': '',
                        'TačanOdgovor': 'true',
                        'SlikaURL': '',
                        'YouTubeURL': '',
                        'Objašnjenje': 'Zemlja je sferni oblik'
                      }
                    ];
                    
                    const ws = XLSX.utils.json_to_sheet(template);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Pitanja');
                    XLSX.writeFile(wb, 'kviz_template.xlsx');
                    
                    toast({ title: 'Template preuzet! 📥', description: 'Otvorite fajl i dodajte svoja pitanja' });
                  }}
                  variant="outline"
                  className="border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold px-8 py-6 text-lg"
                >
                  <Upload className="mr-2" />
                  Preuzmi Template
                </Button>
                
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  style={{ display: 'none' }}
                  id="excel-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('excel-upload').click()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-6 text-lg"
                >
                  <FileSpreadsheet className="mr-2" />
                  Učitaj Excel
                </Button>
              </div>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h4 className="font-black text-lg mb-3">📝 Format Excel fajla:</h4>
                <ul className="text-left text-sm space-y-2 max-w-2xl mx-auto">
                  <li className="font-medium"><strong>Tip:</strong> "multiple" ili "true-false"</li>
                  <li className="font-medium"><strong>Pitanje:</strong> Tekst pitanja</li>
                  <li className="font-medium"><strong>Opcija1-4:</strong> Odgovori (samo za multiple choice)</li>
                  <li className="font-medium"><strong>TačanOdgovor:</strong> Broj (1-4) za multiple, "true"/"false" za true-false</li>
                  <li className="font-medium"><strong>SlikaURL:</strong> Link ka slici (opciono)</li>
                  <li className="font-medium"><strong>YouTubeURL:</strong> Link ka YouTube videu (opciono)</li>
                  <li className="font-medium"><strong>Objašnjenje:</strong> Objašnjenje tačnog odgovora (opciono)</li>
                </ul>
              </div>
            </div>
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