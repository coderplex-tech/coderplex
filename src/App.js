import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserProfile } from './components/UserProfile';
import { Community } from './components/Community';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { AnimatedBackground } from './components/AnimatedBackground';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './lib/supabase';
function App() {
    const [session, setSession] = useState(null);
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        // Listen for auth changes
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);
    return (_jsx(ThemeProvider, { children: _jsx(Router, { children: _jsxs("div", { className: "min-h-screen flex flex-col bg-light-900 dark:bg-dark-900 transition-colors duration-200", children: [_jsx(AnimatedBackground, {}), _jsxs("div", { className: "relative flex flex-col min-h-screen", children: [session && _jsx(Navbar, {}), _jsx("main", { className: `flex-grow ${session ? 'container mx-auto px-4 py-8' : ''}`, children: _jsx(Routes, { children: session ? (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/profile", element: _jsx(UserProfile, { session: session }) }), _jsx(Route, { path: "/community", element: _jsx(Community, { session: session }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/profile", replace: true }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })) }) }), _jsx(Footer, {})] })] }) }) }));
}
export default App;
