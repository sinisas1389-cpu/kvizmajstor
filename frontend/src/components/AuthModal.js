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