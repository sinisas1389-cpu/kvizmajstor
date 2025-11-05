import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import QuizzesPage from "./pages/QuizzesPage";
import QuizSetupPage from "./pages/QuizSetupPage";
import QuizTakePage from "./pages/QuizTakePage";
import QuizResultPage from "./pages/QuizResultPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CreateQuizPage from "./pages/CreateQuizPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPanelPage from "./pages/AdminPanelPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quiz/:id" element={<QuizTakePage />} />
            <Route path="/quiz/:id/result" element={<QuizResultPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/create-quiz" element={<CreateQuizPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
