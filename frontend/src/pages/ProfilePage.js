import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { mockUserProgress } from '../utils/mock';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <Card className="border-4 border-red-300 max-w-md">
          <CardContent className="p-12 text-center">
            <p className="text-3xl font-black text-gray-800 mb-4">Please login first! 🔒</p>
            <Button onClick={() => navigate('/')} className="font-bold">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all">
              <span className="text-6xl">{user.avatar}</span>
            </div>
          </div>
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {user.username}
            </span>
          </h1>
          <p className="text-xl text-gray-600 font-medium">{user.email}</p>
          {user.isAdmin && (
            <Badge className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-6 py-2 text-lg">
              👑 Admin
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="border-4 border-blue-300 shadow-xl transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-black text-blue-600 mb-1">{mockUserProgress.totalScore}</p>
              <p className="text-sm font-bold text-gray-600">Total Score</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-green-300 shadow-xl transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-black text-green-600 mb-1">{mockUserProgress.totalQuizzes}</p>
              <p className="text-sm font-bold text-gray-600">Quizzes Taken</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-orange-300 shadow-xl transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-black text-orange-600 mb-1">{mockUserProgress.averageScore}%</p>
              <p className="text-sm font-bold text-gray-600">Average Score</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-purple-300 shadow-xl transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-black text-purple-600 mb-1">#{mockUserProgress.rank}</p>
              <p className="text-sm font-bold text-gray-600">Global Rank</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Badges */}
          <Card className="border-4 border-yellow-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <Award className="w-6 h-6" />
                Achievements 🏆
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {mockUserProgress.badges.map(badge => (
                  <div
                    key={badge.id}
                    className={`p-6 rounded-2xl border-4 text-center transform transition-all ${
                      badge.earned
                        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400 hover:scale-105'
                        : 'bg-gray-100 border-gray-300 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="font-black text-sm text-gray-800">{badge.name}</p>
                    {badge.earned && (
                      <Badge className="mt-2 bg-green-500 text-white text-xs">Earned!</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-4 border-pink-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100">
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Recent Activity 📈
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockUserProgress.recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-white rounded-xl border-2 border-gray-200"
                  >
                    <div>
                      <p className="font-black text-gray-800">{activity.quizTitle}</p>
                      <p className="text-sm text-gray-500 font-medium">{activity.date}</p>
                    </div>
                    <Badge
                      className={`font-black text-lg px-4 py-2 ${
                        activity.score >= 80
                          ? 'bg-green-500 text-white'
                          : activity.score >= 60
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {activity.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="border-4 border-green-400 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-8">
              <h3 className="text-3xl font-black text-gray-800 mb-4">Keep Learning! 🚀</h3>
              <p className="text-lg text-gray-600 font-medium mb-6">
                Take more quizzes to improve your ranking and earn badges!
              </p>
              <Button
                onClick={() => navigate('/quizzes')}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-10 py-6 text-xl font-bold rounded-2xl"
              >
                Browse Quizzes 📚
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;