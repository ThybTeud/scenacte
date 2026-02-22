import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/routing/PrivateRoute';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import ServerWakeUp from './components/ServerWakeUp';

// Pages
import AuthPage from './pages/auth/AuthPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import LibraryPage from './pages/library/LibraryPage';
import EditorPage from './pages/editor/EditorPage';
import ProfilePage from './pages/profile/ProfilePage';
import LegalPage from './pages/legal/LegalPage';
import { NotFound } from './pages/NotFound';
import DevPlayground from './pages/DevPlayground';
import TemplateLab from './pages/dev/TemplateLab';

function RootRedirect() {
  const { user, guestMode } = useAuth();

  if (user || guestMode) {
    return <Navigate to="/library" replace />;
  }
  return <Navigate to="/login" replace />;
}

// Redirection legacy /plays/:id vers /editor/:id
function PlayIdRedirect() {
  const { id } = useParams();
  return <Navigate to={`/editor/${id}`} replace />;
}

function App() {
  const [serverReady, setServerReady] = useState(false);

  return (
    <>
      {/* Écran de chargement au démarrage */}
      <ServerWakeUp onReady={() => setServerReady(true)} />

      {/* Application principale - s'affiche en arrière-plan */}
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Toaster />

            <Routes>
              <Route path="/" element={<RootRedirect />} />

              {/* Auth routes */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/forgot-password" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* DEV only */}
              {import.meta.env.DEV && (
                <>
                  <Route path="/dev" element={<DevPlayground />} />
                  <Route path="/lab" element={<TemplateLab />} />
                </>
              )}

              {/* Legal routes */}
              <Route path="/legal/:docType" element={<LegalPage />} />

              {/* Protected routes */}
              <Route
                path="/library"
                element={
                  <PrivateRoute>
                    <LibraryPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/editor/:id"
                element={
                  <PrivateRoute>
                    <EditorPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute requireAuth>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
