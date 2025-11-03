import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trophy, Target, Clock, Share2, BookOpen } from 'lucide-react';
import YouTubePlayer from '../components/YouTubePlayer';

const QuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, quiz, userAnswers, questions } = location.state || {};

  if (!result || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">\n        <Card className="border-4 border-red-300">
          <CardContent className="p-12 text-center">
            <p className="text-3xl font-black text-gray-800 mb-4">Rezultat nije pronađen! 😢</p>
            <Button onClick={() => navigate('/quizzes')} className="font-bold">
              Nazad na Kvizove
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPassed = result.score >= 70;
  
  // Pronađi pitanja sa YouTube linkovima na koja je korisnik pogrešno odgovorio
  const wrongAnswersWithVideos = [];
  if (userAnswers && questions) {
    userAnswers.forEach((answer, idx) => {
      const question = questions[idx];
      if (question && answer.answer !== question.correctAnswer && question.youtubeUrl) {
        wrongAnswersWithVideos.push({
          question: question.question,
          youtubeUrl: question.youtubeUrl,
          explanation: question.explanation
        });
      }
    });
  }

  return (
    <div className={`min-h-screen py-12 px-6 ${isPassed ? 'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50' : 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Result Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 transform hover:scale-110 transition-all">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto ${isPassed ? 'bg-gradient-to-br from-green-400 to-blue-400' : 'bg-gradient-to-br from-orange-400 to-red-400'} shadow-2xl`}>
              <Trophy className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-black mb-4">
            {isPassed ? (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
                Awesome! 🎉
              </span>
            ) : (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                Good Try! 💪
              </span>
            )}
          </h1>
          <p className="text-2xl text-gray-600 font-bold">{quiz.title}</p>
        </div>

        {/* Score Card */}
        <Card className={`border-4 shadow-2xl mb-8 ${isPassed ? 'border-green-400' : 'border-orange-400'}`}>
          <CardContent className="p-12">
            <div className="text-center mb-8">
              <div className={`text-8xl font-black mb-4 ${isPassed ? 'text-green-600' : 'text-orange-600'}`}>
                {result.score}%
              </div>
              <p className="text-2xl font-bold text-gray-700">
                {isPassed ? 'You passed! 🎓' : 'Keep practicing! 📚'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-2xl p-6 text-center border-2 border-blue-200">
                <Target className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <p className="text-sm font-bold text-gray-600 mb-1">Correct Answers</p>
                <p className="text-3xl font-black text-blue-600">
                  {result.correctCount}/{result.totalQuestions}
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 text-center border-2 border-purple-200">
                <Trophy className="w-10 h-10 mx-auto mb-3 text-purple-600" />
                <p className="text-sm font-bold text-gray-600 mb-1">Score</p>
                <p className="text-3xl font-black text-purple-600">{result.score}%</p>
              </div>

              <div className="bg-pink-50 rounded-2xl p-6 text-center border-2 border-pink-200">
                <Clock className="w-10 h-10 mx-auto mb-3 text-pink-600" />
                <p className="text-sm font-bold text-gray-600 mb-1">Time Limit</p>
                <p className="text-3xl font-black text-pink-600">{quiz.timeLimit}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(`/quiz/${quiz.id}`)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-bold rounded-xl"
          >
            Try Again 🔁
          </Button>
          <Button
            onClick={() => navigate('/quizzes')}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-6 text-lg font-bold rounded-xl"
          >
            More Quizzes 🚀
          </Button>
          <Button
            onClick={() => navigate('/leaderboard')}
            variant="outline"
            className="border-4 border-purple-500 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg font-bold rounded-xl"
          >
            Leaderboard 🏆
          </Button>
        </div>

        {/* Share Section */}
        <div className="mt-12 text-center">
          <Card className="border-4 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-8">
              <Share2 className="w-12 h-12 mx-auto mb-4 text-orange-600" />
              <h3 className="text-2xl font-black text-gray-800 mb-2">Share Your Score!</h3>
              <p className="text-gray-600 font-medium mb-4">
                Challenge your friends to beat your score!
              </p>
              <Button
                onClick={() => {
                  const text = `I scored ${result.score}% on "${quiz.title}" quiz! Can you beat my score? 🏆`;
                  navigator.clipboard.writeText(text);
                  alert('Score copied to clipboard!');
                }}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-xl"
              >
                Copy Score 📋
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;