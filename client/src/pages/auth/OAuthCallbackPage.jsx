import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      loginWithToken(token);
      navigate('/library', { replace: true });
    } else {
      navigate('/login?error=oauth', { replace: true });
    }
  }, []);

  return null;
}
