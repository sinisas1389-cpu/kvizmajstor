import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Trophy, BookOpen, Plus } from 'lucide-react';
import AuthModal from './AuthModal';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white border-b-4 border-purple-300 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all">
                <span className="text-2xl font-black text-white">🧠</span>
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                QuizMaster
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/quizzes"
                className="flex items-center gap-2 font-bold text-gray-700 hover:text-purple-600 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Quizzes
              </Link>
              <Link
                to="/leaderboard"
                className="flex items-center gap-2 font-bold text-gray-700 hover:text-purple-600 transition-colors"
              >
                <Trophy className="w-5 h-5" />
                Leaderboard
              </Link>
              {isAuthenticated && (
                <Link
                  to="/create-quiz"
                  className="flex items-center gap-2 font-bold text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create
                </Link>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    className="font-bold border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    <User className="mr-2 w-4 h-4" />
                    {user.username}
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold"
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => handleAuthClick('login')}
                    variant="outline"
                    className="font-bold border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t-2 border-purple-200 space-y-3">
              <Link
                to="/quizzes"
                className="block py-3 px-4 rounded-lg font-bold text-gray-700 hover:bg-purple-50"
                onClick={() => setIsMenuOpen(false)}
              >
                📚 Quizzes
              </Link>
              <Link
                to="/leaderboard"
                className="block py-3 px-4 rounded-lg font-bold text-gray-700 hover:bg-purple-50"
                onClick={() => setIsMenuOpen(false)}
              >
                🏆 Leaderboard
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/create-quiz"
                    className="block py-3 px-4 rounded-lg font-bold text-gray-700 hover:bg-purple-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ✨ Create Quiz
                  </Link>
                  <Link
                    to="/profile"
                    className="block py-3 px-4 rounded-lg font-bold text-gray-700 hover:bg-purple-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 rounded-lg font-bold text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <button
                    onClick={() => {
                      handleAuthClick('login');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 rounded-lg font-bold text-purple-600 hover:bg-purple-50"
                  >
                    🔑 Login
                  </button>
                  <button
                    onClick={() => {
                      handleAuthClick('signup');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 rounded-lg font-bold text-purple-600 hover:bg-purple-50"
                  >
                    ✨ Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </>
  );
};

export default Navbar;