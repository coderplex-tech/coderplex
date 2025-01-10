import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
export function Community({ session }) {
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    useEffect(() => {
        fetchProfiles();
    }, []);
    async function fetchProfiles() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('user_id', session.user.id);
        if (error) {
            console.error('Error fetching profiles:', error);
            return;
        }
        if (data) {
            setProfiles(data);
        }
    }
    return (_jsxs("div", { className: "container mx-auto", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: profiles.map(profile => (_jsxs("div", { className: "bg-white dark:bg-dark-800 rounded-lg shadow p-6 cursor-pointer \n            hover:shadow-lg transition-all duration-200", onClick: () => setSelectedProfile(profile), children: [_jsx("h3", { className: "text-xl font-bold mb-2 text-gray-900 dark:text-white", children: profile.name }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 mb-4 line-clamp-2", children: profile.bio }), _jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: [profile.company && (_jsxs("p", { className: "mb-2", children: ["Currently at ", profile.company] })), profile.skills?.split(',').slice(0, 3).map(skill => (_jsx("span", { className: "inline-block bg-gray-100 dark:bg-dark-700 rounded px-2 py-1 mr-2 mb-2", children: skill.trim() }, skill)))] })] }, profile.user_id))) }), selectedProfile && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] \n          overflow-y-auto transition-colors duration-200", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-2 text-gray-900 dark:text-white", children: selectedProfile.name }), _jsx("p", { className: "text-gray-600 dark:text-gray-300", children: selectedProfile.bio })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "font-semibold mb-2 text-gray-900 dark:text-white", children: "Skills" }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedProfile.skills?.split(',').map(skill => (_jsx("span", { className: "bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 \n                    text-gray-700 dark:text-gray-300", children: skill.trim() }, skill))) })] }), _jsxs("div", { className: "space-y-2", children: [selectedProfile.github && (_jsx("a", { href: selectedProfile.github, className: "block text-pink-600 dark:text-pink-400 hover:underline", children: "GitHub" })), selectedProfile.linkedin && (_jsx("a", { href: selectedProfile.linkedin, className: "block text-pink-600 dark:text-pink-400 hover:underline", children: "LinkedIn" })), selectedProfile.website && (_jsx("a", { href: selectedProfile.website, className: "block text-pink-600 dark:text-pink-400 hover:underline", children: "Website" }))] }), _jsx("button", { onClick: () => setSelectedProfile(null), className: "mt-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded \n              transition-colors duration-200", children: "Close" })] }) }))] }));
}
