import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { mockCategories, mockQuizzes, mockLeaderboard } from '../utils/mock';
import { Sparkles, Trophy, Users, Zap, Award, Medal } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Hero Sekcija */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center relative z-10">
            <div className="inline-block mb-6">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold transform -rotate-2 inline-block shadow-lg">
                🎓 UČITE • KVIZ • POBEDITE! 🏆
              </span>
            </div>
            <h1 className="text-7xl font-black mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Unapredite Svoju
              </span>
              <br />
              <span className="text-orange-500">Moć Uma!</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
              Zaronite u uzbudljive kvizove, izazovite prijatelje i postanite šampion znanja! 🚀
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => navigate('/quizzes')}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all"
              >
                <Sparkles className="mr-2" />
                Počni Kviz!
              </Button>
              <Button
                onClick={() => navigate('/leaderboard')}
                variant="outline"
                className="border-4 border-purple-500 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all"
              >
                <Trophy className="mr-2" />
                Rang Lista
              </Button>
            </div>
          </div>

          {/* Lebdeći comic elementi */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-400 rounded-full animate-bounce opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-400 rounded-full animate-pulse opacity-20"></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-blue-400 rounded-full animate-bounce opacity-20" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </section>

      {/* Sekcija Karakteristika */}
      <section className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Zašto KvizMajstor? 🎯
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-4 border-orange-200 shadow-xl transform hover:scale-105 transition-all hover:rotate-1">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-gray-800">Munje Brzo</h3>
                <p className="text-gray-600 font-medium">Brzi kvizovi dizajnirani za maksimalno učenje u minimalnom vremenu!</p>
              </CardContent>
            </Card>

            <Card className="border-4 border-blue-200 shadow-xl transform hover:scale-105 transition-all hover:-rotate-1">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-6">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-gray-800">Takmiči Se i Pobedi</h3>
                <p className="text-gray-600 font-medium">Izazovi prijatelje i popni se na globalnu rang listu!</p>
              </CardContent>
            </Card>

            <Card className="border-4 border-purple-200 shadow-xl transform hover:scale-105 transition-all hover:rotate-1">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-gray-800">Osvoji Značke</h3>
                <p className="text-gray-600 font-medium">Otključaj dostignuća i pokaži svoje znanje!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leaderboard Sekcija */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Leaderboard 🏆
              </span>
            </h2>
            <p className="text-xl text-gray-600 font-medium">Top Quiz Masters of the Week!</p>
          </div>

          {/* Top 3 Podijum */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* 2. Mesto */}
            <div className="md:order-1 order-2">
              <Card className="border-4 border-gray-300 shadow-xl transform hover:scale-105 transition-all bg-gradient-to-br from-gray-50 to-gray-100">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🥈</span>
                    </div>
                  </div>
                  <div className="text-5xl mb-4">{mockLeaderboard[1].avatar}</div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">{mockLeaderboard[1].username}</h3>
                  <p className="text-4xl font-black text-gray-700 mb-2">{mockLeaderboard[1].score}</p>
                  <p className="text-sm text-gray-600 font-bold">poena</p>
                  <div className="mt-4 pt-4 border-t-2 border-gray-300">
                    <p className="text-sm text-gray-600 font-bold">{mockLeaderboard[1].quizzesCompleted} kvizova završeno</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 1. Mesto - Centralno i Najveće */}
            <div className="md:order-2 order-1">
              <Card className="border-4 border-yellow-400 shadow-2xl transform hover:scale-105 transition-all bg-gradient-to-br from-yellow-100 to-orange-100 md:-mt-8">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="text-6xl mb-4">{mockLeaderboard[0].avatar}</div>
                  <h3 className="text-3xl font-black text-gray-800 mb-3">{mockLeaderboard[0].username}</h3>
                  <p className="text-5xl font-black text-orange-600 mb-2">{mockLeaderboard[0].score}</p>
                  <p className="text-lg text-gray-700 font-bold">points</p>
                  <div className="mt-6 pt-4 border-t-2 border-yellow-400">
                    <p className="text-base text-gray-700 font-bold">{mockLeaderboard[0].quizzesCompleted} quizzes completed</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3. Mesto */}
            <div className="md:order-3 order-3">
              <Card className="border-4 border-orange-300 shadow-xl transform hover:scale-105 transition-all bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl mb-4">{mockLeaderboard[2].avatar}</div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">{mockLeaderboard[2].username}</h3>
                  <p className="text-4xl font-black text-orange-600 mb-2">{mockLeaderboard[2].score}</p>
                  <p className="text-sm text-gray-600 font-bold">points</p>
                  <div className="mt-4 pt-4 border-t-2 border-orange-300">
                    <p className="text-sm text-gray-600 font-bold">{mockLeaderboard[2].quizzesCompleted} quizzes completed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ostali 4-10 */}
          <Card className="border-4 border-purple-200 shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                {mockLeaderboard.slice(3, 10).map((user, idx) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center font-black text-white text-xl">
                        {idx + 4}
                      </div>
                      <div className="text-3xl">{user.avatar}</div>
                      <div>
                        <h4 className="font-black text-gray-800 text-lg">{user.username}</h4>
                        <p className="text-sm text-gray-600 font-medium">{user.quizzesCompleted} kvizova završeno</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-purple-600">{user.score}</p>
                      <p className="text-xs text-gray-600 font-bold">poena</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dugme za punu rang listu */}
          <div className="text-center mt-8">
            <Button
              onClick={() => navigate('/leaderboard')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-xl"
            >
              <Trophy className="mr-2" />
              Pogledaj Punu Rang Listu
            </Button>
          </div>
        </div>
      </section>

      {/* Pregled Kategorija */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
              Istraži Kategorije 🎨
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mockCategories.map((category, idx) => (
              <Card
                key={category.id}
                onClick={() => navigate('/quizzes', { state: { categoryId: category.id } })}
                className="cursor-pointer border-4 shadow-lg transform hover:scale-110 transition-all hover:-rotate-3 overflow-hidden"
                style={{ borderColor: category.color }}
              >
                <CardContent className="p-6 text-center" style={{ backgroundColor: category.color + '20' }}>
                  <div className="text-5xl mb-3">{category.icon}</div>
                  <h3 className="font-black text-gray-800 text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-600 font-bold">{category.quizCount} kvizova</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Sekcija */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Spreman da Postaneš Kviz Legenda? 🌟
          </h2>
          <p className="text-xl text-white/90 mb-8 font-medium">
            Pridruži se hiljadama učenika koji uspevaju svakog dana!
          </p>
          <Button
            onClick={() => navigate('/quizzes')}
            className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-6 text-xl font-black rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
          >
            Počni Odmah! 🚀
          </Button>
        </div>
      </section>

      {/* YouTube Channel Banner */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <Card className="border-4 border-red-500 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-12 text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <h2 className="text-5xl font-black text-white">
                    Pratite nas na YouTube! 📺
                  </h2>
                </div>
                <p className="text-2xl text-white/95 mb-8 font-bold">
                  Video lekcije, objašnjenja i još mnogo toga!
                </p>
                <Button
                  onClick={() => {
                    // Ovde će biti tvoj YouTube kanal URL kada ga napraviš
                    window.open('https://youtube.com/@tvojkanal', '_blank');
                  }}
                  className="bg-white text-red-600 hover:bg-gray-100 px-12 py-6 text-2xl font-black rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
                >
                  <svg className="inline-block w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 9.333L15.333 12 10 14.667v-5.334z"/>
                  </svg>
                  Pretplati Se Besplatno!
                </Button>
                <p className="mt-6 text-white/90 text-lg font-medium">
                  🔔 Budi obavešten o novim video lekcijama
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;