import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-900 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-200 dark:bg-dark-900 transition-colors duration-200">
          <div className="relative flex flex-col min-h-screen">
            {session && <Navbar />}
            <main className={`flex-grow ${session ? 'py-8' : ''}`}>
              <Routes>
                <Route path="/profile/:id" element={<PublicProfile />} />
                {session ? (
                  <>
                    <Route path="/profile" element={<UserProfile session={session} />} />
                    <Route path="/community" element={<Community session={session} />} />
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
