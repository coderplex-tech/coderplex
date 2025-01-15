import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
          // Check onboarding status
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('user_id', session.user.id)
            .maybeSingle();  // Use maybeSingle() instead of single()

          if (error) {
            console.error('Error checking onboarding status:', error);
            return;
          }

          setOnboardingCompleted(data?.onboarding_completed ?? false);
        }
        setLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  // Redirect to onboarding if not completed
  if (!onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
} 