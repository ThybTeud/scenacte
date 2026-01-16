import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/routing/PrivateRoute';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import AuthPage from './pages/auth/AuthPage';
import LibraryPage from './pages/library/LibraryPage';
import EditorPage from './pages/editor/EditorPage';
import ProfilePage from './pages/profile/ProfilePage';
import LegalPage from './pages/legal/LegalPage';
import { NotFound } from './pages/NotFound';

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
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Toaster />

          <Routes>
            <Route path="/" element={<RootRedirect />} />

            {/* Auth routes - toutes gérées par AuthPage */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/forgot-password" element={<AuthPage />} />
            <Route path="/reset-password" element={<AuthPage />} />

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

            {/* Redirects pour rétrocompatibilité */}
            <Route path="/plays" element={<Navigate to="/library" replace />} />
            <Route path="/plays/:id" element={<PlayIdRedirect />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
