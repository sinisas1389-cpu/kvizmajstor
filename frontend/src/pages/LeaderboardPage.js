import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockLeaderboard } from '../utils/mock';
import { Trophy, Medal, Award } from 'lucide-react';

const LeaderboardPage = () => {
  const getRankIcon = (rank) => {
    switch(rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400 fill-gray-300" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-500 fill-orange-400" />;
      default:
        return <Award className="w-6 h-6 text-gray-400" />;
    }
  };

  const getRankBg = (rank) => {
    switch(rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 border-gray-500';
      case 3:
        return 'bg-gradient-to-r from-orange-300 to-orange-400 border-orange-500';
      default:
        return 'bg-white border-purple-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-black mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Leaderboard 🏆
            </span>
          </h1>
          <p className="text-xl text-gray-600 font-medium">Top Quiz Masters of the Week!</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* 2nd Place */}
          <div className="md:order-1 transform md:translate-y-8">
            <Card className="border-4 border-gray-400 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-gray-300 to-gray-400 p-6 text-center">
                <div className="text-6xl mb-3">🥈</div>
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3 border-4 border-gray-500">
                  <span className="text-4xl">{mockLeaderboard[1].avatar}</span>
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-1">{mockLeaderboard[1].username}</h3>
                <p className="text-3xl font-black text-gray-800">{mockLeaderboard[1].score}</p>
                <p className="text-sm font-bold text-gray-700">points</p>
              </div>
              <CardContent className="p-4 bg-gray-50">
                <p className="text-center text-sm font-bold text-gray-600">
                  {mockLeaderboard[1].quizzesCompleted} quizzes completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 1st Place */}
          <div className="md:order-2">
            <Card className="border-4 border-yellow-500 shadow-2xl overflow-hidden transform scale-105">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 text-center">
                <div className="text-7xl mb-3">🏆</div>
                <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-3 border-4 border-yellow-600">
                  <span className="text-5xl">{mockLeaderboard[0].avatar}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-1">{mockLeaderboard[0].username}</h3>
                <p className="text-4xl font-black text-gray-800">{mockLeaderboard[0].score}</p>
                <p className="text-sm font-bold text-gray-700">points</p>
              </div>
              <CardContent className="p-4 bg-yellow-50">
                <p className="text-center text-sm font-bold text-gray-600">
                  {mockLeaderboard[0].quizzesCompleted} quizzes completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 3rd Place */}
          <div className="md:order-3 transform md:translate-y-12">
            <Card className="border-4 border-orange-400 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-orange-300 to-orange-500 p-6 text-center">
                <div className="text-6xl mb-3">🥉</div>
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3 border-4 border-orange-500">
                  <span className="text-4xl">{mockLeaderboard[2].avatar}</span>
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-1">{mockLeaderboard[2].username}</h3>
                <p className="text-3xl font-black text-gray-800">{mockLeaderboard[2].score}</p>
                <p className="text-sm font-bold text-gray-700">points</p>
              </div>
              <CardContent className="p-4 bg-orange-50">
                <p className="text-center text-sm font-bold text-gray-600">
                  {mockLeaderboard[2].quizzesCompleted} quizzes completed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rest of Leaderboard */}
        <Card className="border-4 border-purple-300 shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-3">
              {mockLeaderboard.slice(3).map((user, idx) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 font-black text-purple-600">
                    #{idx + 4}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-gray-800">{user.username}</h4>
                    <p className="text-sm text-gray-500 font-medium">{user.quizzesCompleted} quizzes</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg px-4 py-2">
                    {user.score}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="border-4 border-green-400 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-8">
              <h3 className="text-3xl font-black text-gray-800 mb-2">Want to Join the Top? 🚀</h3>
              <p className="text-lg text-gray-600 font-medium">
                Complete more quizzes and climb the leaderboard!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;