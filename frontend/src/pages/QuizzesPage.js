import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { categoriesAPI, quizzesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Search, Clock, Star, Play, Filter, Edit, Trash2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const QuizzesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(location.state?.categoryId || 'all');
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Greška pri učitavanju kategorija:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (!window.confirm(`Da li ste sigurni da želite da obrišete kviz "${quizTitle}"?`)) {
      return;
    }

    try {
      await quizzesAPI.delete(quizId);
      toast({ title: 'Kviz uspešno obrisan! 🗑️' });
      // Refresh page to show updated list
      window.location.reload();
    } catch (error) {
      console.error('Greška pri brisanju kviza:', error);
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.detail || 'Nije moguće obrisati kviz',
        variant: 'destructive' 
      });
    }
  };

  const canEditQuiz = (quiz) => {
    if (!isAuthenticated) return false;
    if (user?.isAdmin) return true;
    if (user?.isCreator && quiz.createdBy === user.username) return true;
    return false;
  };

  const filteredQuizzes = mockQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || quiz.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Zaglavlje */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Pretraži Kvizove 📚
            </span>
          </h1>
          <p className="text-xl text-gray-600 font-medium">Pronađi svoj savršeni izazov!</p>
        </div>

        {/* Pretraga i Filteri */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 border-4 border-purple-200">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Pretraži kvizove..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6 text-lg border-2 border-gray-300 rounded-xl"
              />
            </div>
          </div>

          {/* Filter Kategorija */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-gray-700">Kategorije:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                onClick={() => setSelectedCategory('all')}
                className={`cursor-pointer px-4 py-2 text-sm font-bold ${selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Sve
              </Badge>
              {categories.map(cat => (
                <Badge
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`cursor-pointer px-4 py-2 text-sm font-bold ${selectedCategory === cat.id ? 'text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  {cat.icon} {cat.name}
                </Badge>
              ))}
            </div>
          </div>

        </div>

        {/* Mreža Kvizova */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredQuizzes.map(quiz => {
            const category = categories.find(c => c.id === quiz.categoryId);
            return (
              <Card
                key={quiz.id}
                className="border-4 shadow-xl transform hover:scale-105 transition-all hover:-rotate-1 overflow-hidden"
                style={{ borderColor: category?.color }}
              >
                <CardHeader
                  className="pb-4"
                  style={{ backgroundColor: category?.color + '30' }}
                >
                  <div className="flex justify-end items-start mb-2">
                    <span className="text-3xl">{category?.icon}</span>
                  </div>
                  <CardTitle className="text-2xl font-black text-gray-800">
                    {quiz.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 mb-4 font-medium">{quiz.description}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1 font-bold text-gray-700">
                      <Clock className="w-4 h-4" />
                      {quiz.timeLimit} min
                    </div>
                    <div className="flex items-center gap-1 font-bold text-gray-700">
                      <Play className="w-4 h-4" />
                      {quiz.plays} igara
                    </div>
                    <div className="flex items-center gap-1 font-bold text-gray-700">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {quiz.rating}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {canEditQuiz(quiz) && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
                          variant="outline"
                          className="flex-1 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Uredi
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          variant="destructive"
                          className="flex-1 font-bold"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Obriši
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">od {quiz.createdBy}</span>
                      <Button
                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-xl px-6"
                      >
                        Počni Kviz! 🚀
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-3xl font-black text-gray-400">Nema pronađenih kvizova! 😢</p>
            <p className="text-lg text-gray-500 mt-2">Pokušaj prilagoditi filtere</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;