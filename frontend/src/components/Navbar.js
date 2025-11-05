import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Trophy, BookOpen, Plus, Shield } from 'lucide-react';
import AuthModal from './AuthModal';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Funkcija za skraćivanje korisničkog imena
  const getDisplayName = (username) => {
    if (!username) return '';
    
    // Ako je email, uzmi deo pre @
    if (username.includes('@')) {
      const emailPart = username.split('@')[0];
      // Ako je još uvek predugačko, skrati na 12 karaktera
      return emailPart.length > 12 ? emailPart.substring(0, 12) + '...' : emailPart;
    }
    
    // Ako je obično username, skrati na 15 karaktera
    return username.length > 15 ? username.substring(0, 15) + '...' : username;
  };

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
                KvizMajstor
              </span>
            </Link>

            {/* Desktop Meni */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/quizzes"
                className="flex items-center gap-2 font-bold text-gray-700 hover:text-purple-600 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Kvizovi
              </Link>
              <Link
                to="/leaderboard"
                className="flex items-center gap-2 font-bold text-gray-700 hover:text-purple-600 transition-colors"
              >
                <Trophy className="w-5 h-5" />
                Rang Lista
              </Link>
              <a
                href="https://youtube.com/@tvojkanal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
              {(isAuthenticated && (user?.isAdmin || user?.isCreator)) && (
                <Link
                  to="/create-quiz"
                  className="flex items-center gap-2 font-bold text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Napravi
                </Link>
              )}
              {(isAuthenticated && user?.isAdmin) && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 font-bold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </Link>
              )}
            </div>

            {/* Auth Dugmad */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    className="font-bold border-2 border-purple-500 text-purple-600 hover:bg-purple-50 max-w-[200px]"
                  >
                    <User className="mr-2 w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{getDisplayName(user.username)}</span>
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold"
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    Odjavi se
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => handleAuthClick('login')}
                    variant="outline"
                    className="font-bold border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    Prijavi se
                  </Button>
                  <Button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                  >
                    Registruj se
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Meni Dugme */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Meni */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t-2 border-purple-200 space-y-3">
              <Link
                to="/quizzes"
                className="block py-3 px-4 rounded-lg font-bold text-gray-700 hover:bg-purple-50"
                onClick={() => setIsMenuOpen(false)}
              >
                📚 Kvizovi
              </Link>
              <Link
                to="/leaderboard"
                className="block py-3 px-4 rounded-lg font-bold text-gray-700 hover:bg-purple-50"
                onClick={() => setIsMenuOpen(false)}
              >
                🏆 Rang Lista
              </Link>
              {isAuthenticated && (
                <>
                  {(user?.isAdmin || user?.isCreator) && (
                    <Link
                      to="/create-quiz"
                      className="block py-3 px-4 rounded-lg font-bold text-gray-700 hover:bg-purple-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ✨ Napravi Kviz
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="block py-3 px-4 rounded-lg font-bold text-gray-700 hover:bg-purple-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    👤 Profil
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      to="/admin"
                      className="block py-3 px-4 rounded-lg font-bold text-purple-600 hover:bg-purple-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      👑 Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 rounded-lg font-bold text-red-600 hover:bg-red-50"
                  >
                    🚪 Odjavi se
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
                    🔑 Prijavi se
                  </button>
                  <button
                    onClick={() => {
                      handleAuthClick('signup');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-3 px-4 rounded-lg font-bold text-purple-600 hover:bg-purple-50"
                  >
                    ✨ Registruj se
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