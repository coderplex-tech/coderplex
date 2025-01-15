import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { UserProfile } from './components/UserProfile';
import { Community } from './components/Community';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './lib/supabase';
import { PublicProfile } from './components/PublicProfile';
import { Onboarding } from './components/Onboarding';
import { ProtectedRoute } from './components/ProtectedRoute';

// Create an AppContent component that uses navigation
function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session and check onboarding status
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', session.user.id)
          .single();

        if (!data?.onboarding_completed) {
          navigate('/onboarding');
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      setSession(session);
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', session.user.id)
          .single();

        if (event === 'SIGNED_IN' || !data?.onboarding_completed) {
          navigate('/onboarding');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-900 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-200 dark:bg-dark-900 transition-colors duration-200">
      <div className="relative flex flex-col min-h-screen">
        {session && <Navbar />}
        <main className={`flex-grow ${session ? 'py-8' : ''}`}>
          <Routes>
            <Route path="/profile/:id" element={<PublicProfile />} />
            {session ? (
              <>
                <Route path="/profile" element={<UserProfile session={session} />} />
                <Route 
                  path="/community" 
                  element={
                    <ProtectedRoute>
                      <Community session={session} />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/community" replace />} />
                <Route path="*" element={<Navigate to="/community" replace />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

// Main App component
function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
