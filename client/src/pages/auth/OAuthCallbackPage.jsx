import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/Loader';

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      loginWithToken(token)
        .then(() => navigate('/library', { replace: true }))
        .catch(() => navigate('/login?error=oauth', { replace: true }));
    } else {
      navigate('/login?error=oauth', { replace: true });
    }
  }, []);

  return <Loader fullScreen />;
}
