import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trophy, Target, Clock, Share2, BookOpen } from 'lucide-react';
import YouTubePlayer from '../components/YouTubePlayer';
import confetti from 'canvas-confetti';

const QuizResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, quiz, userAnswers, questions } = location.state || {};
  const fireworksFiredRef = useRef(false);

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
  const isPerfectScore = result.score === 100;
  
  // Vatromet za savršen rezultat - samo jednom!
  useEffect(() => {
    if (isPerfectScore && !fireworksFiredRef.current) {
      fireworksFiredRef.current = true;
      setTimeout(() => {
        firePerfectScoreFireworks();
      }, 500);
    }
  }, [isPerfectScore]);

  const firePerfectScoreFireworks = () => {
    const duration = 5000; // Traje 5 sekundi
    const animationEnd = Date.now() + duration;

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    // Poboljšani efekat rakete - bolja raspodela
    function fireRocket(x, delay = 0) {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          startVelocity: 60,
          spread: 50,
          angle: 90,
          origin: { x, y: 1 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
          ticks: 200,
          gravity: 1,
          scalar: 1.2,
          zIndex: 9999
        });
      }, delay);
    }

    // Poboljšani burst - više raspršen
    function fireBurst(x, y) {
      const burstCount = 3;
      for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 40,
            startVelocity: 40,
            spread: 360,
            angle: randomInRange(0, 360),
            origin: { x: x + randomInRange(-0.1, 0.1), y: y + randomInRange(-0.05, 0.05) },
            colors: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32'],
            ticks: 120,
            gravity: 1,
            scalar: 1.5,
            zIndex: 9999
          });
        }, i * 100);
      }
    }

    // Poboljšano kišanje zvezda - više raspršeno
    function fireStarRain() {
      const positions = [0.2, 0.35, 0.5, 0.65, 0.8];
      positions.forEach((x, i) => {
        setTimeout(() => {
          confetti({
            particleCount: 30,
            startVelocity: 20,
            spread: 40,
            angle: 270,
            origin: { x, y: 0 },
            colors: ['#FFD700', '#FFA500', '#FFFF00'],
            ticks: 200,
            gravity: 0.6,
            scalar: 1.3,
            shapes: ['star', 'circle'],
            zIndex: 9999
          });
        }, i * 150);
      });
    }

    // Spirala sa boljom distribucijom
    function fireSpiral() {
      const spiralCount = 8;
      for (let i = 0; i < spiralCount; i++) {
        setTimeout(() => {
          const angle = (i / spiralCount) * 360;
          confetti({
            particleCount: 20,
            startVelocity: 35,
            spread: 60,
            angle: angle,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#FFD700', '#FF69B4', '#00CED1', '#9370DB'],
            ticks: 150,
            gravity: 0.8,
            drift: randomInRange(-1, 1),
            scalar: 1.2,
            zIndex: 9999
          });
        }, i * 80);
      }
    }

    // Glavni interval sa boljom sekvencom
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      // Rakete sa više pozicija (manje grupisano)
      if (Math.random() < 0.3) {
        const positions = [0.15, 0.35, 0.5, 0.65, 0.85];
        const randomPos = positions[Math.floor(Math.random() * positions.length)];
        fireRocket(randomPos);
      }

      // Burst sa različitim pozicijama (manje grupisano)
      if (Math.random() < 0.25) {
        fireBurst(randomInRange(0.2, 0.8), randomInRange(0.2, 0.5));
      }

      // Kišanje zvezda sa više lokacija
      if (Math.random() < 0.2) {
        fireStarRain();
      }

      // Spirala
      if (Math.random() < 0.15) {
        fireSpiral();
      }

      // Random scatter sa manjim grupama
      if (Math.random() < 0.4) {
        const scatterPositions = [
          { x: 0.2, y: 0.3 },
          { x: 0.5, y: 0.4 },
          { x: 0.8, y: 0.3 },
          { x: 0.35, y: 0.6 },
          { x: 0.65, y: 0.6 }
        ];
        const pos = scatterPositions[Math.floor(Math.random() * scatterPositions.length)];
        confetti({
          particleCount: 15,
          startVelocity: 25,
          spread: 100,
          origin: pos,
          colors: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32'],
          ticks: 100,
          scalar: 1.2,
          zIndex: 9999
        });
      }
    }, 200);
  };
  
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
              <h3 className="text-2xl font-black text-gray-800 mb-2">Podeli Svoj Rezultat!</h3>
              <p className="text-gray-600 font-medium mb-4">
                Izazovi prijatelje da pobede tvoj rezultat!
              </p>
              <Button
                onClick={() => {
                  const text = `Osvojio sam ${result.score}% na kvizu "${quiz.title}"! Možeš li ti bolje? 🏆`;
                  navigator.clipboard.writeText(text);
                  alert('Rezultat kopiran!');
                }}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-xl"
              >
                Kopiraj Rezultat 📋
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Video Lekcije za Poboljšanje */}
        {wrongAnswersWithVideos.length > 0 && (
          <div className="mt-12">
            <Card className="border-4 border-blue-400 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                  <div>
                    <h3 className="text-3xl font-black text-gray-800">
                      Nauči Više! 📚
                    </h3>
                    <p className="text-gray-600 font-medium">
                      Pogledaj ove video lekcije da poboljšaš svoje znanje
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {wrongAnswersWithVideos.map((item, idx) => (
                    <div key={idx}>
                      <h4 className="text-lg font-black text-gray-800 mb-3">
                        ❓ {item.question}
                      </h4>
                      {item.explanation && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                          <p className="text-sm font-medium text-gray-700">
                            💡 <strong>Objašnjenje:</strong> {item.explanation}
                          </p>
                        </div>
                      )}
                      <YouTubePlayer 
                        url={item.youtubeUrl} 
                        title={`Video Lekcija ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultPage;