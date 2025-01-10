import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
export function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };
    return (_jsx("nav", { className: "bg-light-800 dark:bg-dark-800 shadow-sm transition-colors duration-200", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "flex justify-between h-16", children: [_jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0 flex items-center", children: _jsx("span", { className: "text-2xl font-bold text-gray-800 dark:text-gray-100", children: "coderplex" }) }), _jsxs("div", { className: "ml-6 flex space-x-4 items-center", children: [_jsx(Button, { to: "/profile", variant: location.pathname === '/profile' ? 'primary' : 'ghost', size: "md", children: "Profile" }), _jsx(Button, { to: "/community", variant: location.pathname === '/community' ? 'primary' : 'ghost', size: "md", children: "Community" })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Button, { onClick: toggleTheme, variant: "secondary", size: "sm", className: "aspect-square", children: theme === 'dark' ? (_jsx(SunIcon, { className: "w-4 h-4" })) : (_jsx(MoonIcon, { className: "w-4 h-4" })) }), _jsx(Button, { onClick: handleSignOut, variant: "ghost", size: "md", children: "Sign Out" })] })] }) }) }));
}
