import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { CreateCharacter } from './pages/CreateCharacter';
import { CategoryCharacters } from './pages/CategoryCharacters';
import { Credits } from './pages/Credits';
import { MyCredits } from './pages/MyCredits';
import { CreditsSuccess } from './pages/CreditsSuccess';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MissingSupabaseConfig } from './components/MissingSupabaseConfig';
import { isSupabaseConfigured } from './lib/supabase';
import { SidebarProvider } from './contexts/SidebarContext';

export default function App() {
  if (!isSupabaseConfigured()) {
    return <MissingSupabaseConfig />;
  }

  return (
    <Router>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/:categoryId"
            element={
              <ProtectedRoute>
                <CategoryCharacters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:characterId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/characters/new"
            element={
              <ProtectedRoute>
                <CreateCharacter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/credits"
            element={
              <ProtectedRoute>
                <Credits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/credits/success"
            element={
              <ProtectedRoute>
                <CreditsSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-credits"
            element={
              <ProtectedRoute>
                <MyCredits />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SidebarProvider>
    </Router>
  );
}