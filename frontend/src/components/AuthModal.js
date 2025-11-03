import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const AuthModal = ({ mode, onClose, onSwitchMode }) => {
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        toast({ title: 'Welcome back! 🎉' });
      } else {
        await signup(formData.email, formData.username, formData.password);
        toast({ title: 'Account created successfully! 🎓' });
      }
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <Card className="w-full max-w-md border-4 border-purple-400 shadow-2xl animate-in fade-in zoom-in duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="text-3xl font-black text-center">
            {mode === 'login' ? (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Dobrodošli Nazad! 👋
              </span>
            ) : (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
                Pridruži se KvizMajstoru! 🎓
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google OAuth Button */}
            <Button
              type="button"
              onClick={() => {
                toast({ 
                  title: 'Uskoro dostupno!', 
                  description: 'Google prijava će biti aktivirana kada postaviš Google OAuth kredencijale.' 
                });
              }}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 py-6 text-lg font-bold rounded-xl flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {mode === 'login' ? 'Prijavi se' : 'Registruj se'} sa Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-bold">ili</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold mb-2 block flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                type="email"
                placeholder="vas@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="p-6 border-2 rounded-xl"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <Label className="text-sm font-bold mb-2 block flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Korisničko Ime
                </Label>
                <Input
                  type="text"
                  placeholder="Izaberi korisničko ime"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="p-6 border-2 rounded-xl"
                />
              </div>
            )}

            <div>
              <Label className="text-sm font-bold mb-2 block flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Lozinka
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="p-6 border-2 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg font-bold rounded-xl"
            >
              {isLoading ? 'Učitavanje...' : mode === 'login' ? 'Prijavi se 🚀' : 'Registruj se ✨'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 font-medium">
              {mode === 'login' ? "Nemaš nalog? " : 'Već imaš nalog? '}
              <button
                onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-purple-600 font-bold hover:underline"
              >
                {mode === 'login' ? 'Registruj se' : 'Prijavi se'}
              </button>
            </p>
          </div>

          {mode === 'login' && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 font-bold text-center">
                💡 Demo: Koristi bilo koji email i lozinku za prijavu
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;