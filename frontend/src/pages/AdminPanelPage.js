import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { adminAPI, categoriesAPI } from '../utils/api';
import { Shield, Star, Users, Crown, FolderPlus, Trash2, Grid3x3 } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    color: '#FFE66D'
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/');
      return;
    }

    fetchUsers();
    fetchCategories();
  }, [isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Greška pri učitavanju korisnika:', error);
      toast({ 
        title: 'Greška', 
        description: 'Nije moguće učitati korisnike',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Greška pri učitavanju kategorija:', error);
    }
  };

  const handleToggleCreator = async (userId) => {
    try {
      const result = await adminAPI.toggleCreatorStatus(userId);
      toast({ title: result.message });
      fetchUsers(); // Refresh lista
    } catch (error) {
      console.error('Greška:', error);
      toast({ 
        title: 'Greška', 
        description: 'Nije moguće promeniti status',
        variant: 'destructive' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <p className="text-2xl font-bold">Učitavanje...</p>
      </div>
    );
  }

  const creators = users.filter(u => u.isCreator || u.isAdmin);
  const regularUsers = users.filter(u => !u.isCreator && !u.isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-black mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Admin Panel 👑
            </span>
          </h1>
          <p className="text-xl text-gray-600 font-medium">Upravljaj kreatorima i korisnicima</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-4 border-purple-300 shadow-xl">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <p className="text-4xl font-black text-purple-600 mb-2">{users.length}</p>
              <p className="text-sm font-bold text-gray-600">Ukupno Korisnika</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-yellow-300 shadow-xl">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <p className="text-4xl font-black text-yellow-600 mb-2">{creators.length}</p>
              <p className="text-sm font-bold text-gray-600">Kreatori</p>
            </CardContent>
          </Card>

          <Card className="border-4 border-blue-300 shadow-xl">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <p className="text-4xl font-black text-blue-600 mb-2">{regularUsers.length}</p>
              <p className="text-sm font-bold text-gray-600">Obični Korisnici</p>
            </CardContent>
          </Card>
        </div>

        {/* Kreatori */}
        <Card className="border-4 border-yellow-400 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
            <CardTitle className="text-3xl font-black flex items-center gap-2">
              <Star className="w-8 h-8 text-yellow-600" />
              Kreatori ({creators.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {creators.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nema kreatora</p>
            ) : (
              <div className="space-y-3">
                {creators.map(u => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-yellow-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-2xl">
                        {u.avatar}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800 flex items-center gap-2">
                          {u.username}
                          {u.isAdmin && <Badge className="bg-purple-600 text-white">Admin</Badge>}
                          {u.isCreator && <Badge className="bg-yellow-600 text-white">Kreator</Badge>}
                        </h4>
                        <p className="text-sm text-gray-500 font-medium">{u.email}</p>
                        <p className="text-xs text-gray-400 font-bold">
                          {u.quizzesCompleted} kvizova • {u.totalScore} poena
                        </p>
                      </div>
                    </div>
                    {!u.isAdmin && (
                      <Button
                        onClick={() => handleToggleCreator(u.id)}
                        variant="destructive"
                        className="font-bold"
                      >
                        Ukloni Kreatora
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Obični Korisnici */}
        <Card className="border-4 border-blue-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
            <CardTitle className="text-3xl font-black flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Korisnici ({regularUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {regularUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nema korisnika</p>
            ) : (
              <div className="space-y-3">
                {regularUsers.map(u => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-2xl">
                        {u.avatar}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800">{u.username}</h4>
                        <p className="text-sm text-gray-500 font-medium">{u.email}</p>
                        <p className="text-xs text-gray-400 font-bold">
                          {u.quizzesCompleted} kvizova • {u.totalScore} poena
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleToggleCreator(u.id)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
                    >
                      <Star className="mr-2 w-4 h-4" />
                      Dodaj za Kreatora
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanelPage;
