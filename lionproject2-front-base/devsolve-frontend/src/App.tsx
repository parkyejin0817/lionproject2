import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import MentorListPage from './pages/MentorListPage';
import MentorDetailPage from './pages/MentorDetailPage';
import AuthPage from './pages/AuthPage';
import QnAListPage from './pages/QnAListPage';
import MentorDashboardPage from './pages/MentorDashboardPage';
import MenteeDashboardPage from './pages/MenteeDashboardPage';
import PaymentPage from './pages/PaymentPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import QuestionCreatePage from './pages/QuestionCreatePage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import TutorialFormPage from './pages/TutorialFormPage';
import TutorialDetailPage from './pages/TutorialDetailPage';
import PaymentCompletePage from './pages/PaymentCompletePage';
import MentorApplicationPage from './pages/MentorApplicationPage';
import HowItWorksPage from './pages/HowItWorksPage';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
        <Route element={<Layout onToggleDarkMode={toggleDarkMode} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/mentors" element={<MentorListPage />} />
          <Route path="/mentor/:id" element={<MentorDetailPage />} />
          <Route path="/mentor/apply" element={<MentorApplicationPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/qna" element={<QnAListPage />} />
          <Route path="/qna/create" element={<QuestionCreatePage />} />
          <Route path="/qna/:questionId" element={<QuestionDetailPage />} />
          <Route path="/tutorial/:tutorialId" element={<TutorialDetailPage />} />
          <Route path="/tutorial/create" element={<TutorialFormPage />} />
          <Route path="/tutorial/edit/:tutorialId" element={<TutorialFormPage />} />
          <Route path="/mentor/dashboard" element={<MentorDashboardPage />} />
          <Route path="/mypage" element={<MenteeDashboardPage />} />
          <Route path="/payment/:tutorialId" element={<PaymentPage />} />
          <Route path="/payment/complete" element={<PaymentCompletePage />} />
          <Route path="/mypage/payments" element={<PaymentHistoryPage />} />
        </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
