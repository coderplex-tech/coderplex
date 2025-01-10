import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { UserProfile } from './components/UserProfile';
import { Community } from './components/Community';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<Session | null>(null);

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

  if (!session) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/profile" element={<UserProfile session={session} />} />
            <Route path="/community" element={<Community session={session} />} />
            <Route path="/" element={<Navigate to="/profile" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
