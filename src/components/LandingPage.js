import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { TypewriterText } from './TypewriterText';
import { Button } from './ui/Button';
export function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    return (_jsx("div", { className: "min-h-screen relative", children: _jsxs("div", { className: "container mx-auto px-4 relative z-10", children: [_jsxs("nav", { className: "flex items-center justify-between py-6", children: [_jsx("div", { className: "text-2xl font-bold text-gray-800 dark:text-gray-100", children: "coderplex" }), _jsx("div", { className: "flex items-center space-x-4", children: _jsx(Button, { onClick: toggleTheme, variant: "secondary", size: "sm", className: "aspect-square", children: theme === 'dark' ? (_jsx(SunIcon, { className: "w-4 h-4" })) : (_jsx(MoonIcon, { className: "w-4 h-4" })) }) })] }), _jsxs("div", { className: "flex flex-col items-center justify-center min-h-[80vh] text-center", children: [_jsx("h1", { className: "text-7xl md:text-8xl font-bold text-gray-800 dark:text-gray-100 mb-12 \n          hover:scale-105 transition-transform duration-300", children: _jsx(TypewriterText, { phrases: ['coderplexDevCommunity()', 'come say hi'], typingSpeed: 150, deletingSpeed: 100, pauseDuration: 3000 }) }), _jsx(Button, { to: "/login", variant: "primary", size: "lg", className: "hover:scale-105", children: "Login" })] })] }) }));
}
