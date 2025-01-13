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
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Remove dark class by default
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
                    <Route path="/" element={<Navigate to="/profile" replace />} />
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
