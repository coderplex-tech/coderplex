import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
export function UserProfile({ session }) {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        skills: '',
        github: '',
        linkedin: '',
        company: '',
        website: ''
    });
    useEffect(() => {
        fetchProfile();
    }, [session]);
    async function fetchProfile() {
        const { data, error } = await supabase
            .from('profiles')
            .select()
            .eq('user_id', session.user.id)
            .single();
        if (error) {
            console.error('Error fetching profile:', error);
            return;
        }
        if (data) {
            setProfile(data);
            setFormData({
                name: data.name || '',
                bio: data.bio || '',
                skills: data.skills || '',
                github: data.github || '',
                linkedin: data.linkedin || '',
                company: data.company || '',
                website: data.website || ''
            });
        }
    }
    async function updateProfile(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                user_id: session.user.id,
                ...formData,
                updated_at: new Date().toISOString()
            });
            if (error) {
                console.error('Error updating profile:', error);
                setError('Failed to save profile. Please try again.');
                return;
            }
            setProfile({ ...formData, user_id: session.user.id });
            setEditing(false);
        }
        catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred. Please try again.');
        }
        finally {
            setLoading(false);
        }
    }
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto", children: [error && (_jsx("div", { className: "mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 \n        rounded-lg text-red-600 dark:text-red-400 text-sm", children: error })), _jsx("div", { className: "bg-white dark:bg-dark-800 rounded-lg shadow p-6 transition-colors duration-200", children: !editing ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-2 text-gray-900 dark:text-white", children: profile?.name || 'New User' }), profile?.company && (_jsxs("p", { className: "text-gray-600 dark:text-gray-300 mb-2", children: ["Currently at ", profile.company] })), _jsx("p", { className: "text-gray-600 dark:text-gray-300", children: profile?.bio || 'No bio yet' })] }), _jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "font-semibold mb-2 text-gray-900 dark:text-white", children: "Skills" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300", children: profile?.skills || 'No skills listed' })] }), _jsxs("div", { className: "space-y-2", children: [profile?.github && (_jsx("a", { href: profile.github, className: "block text-pink-600 dark:text-pink-400 hover:underline", children: "GitHub" })), profile?.linkedin && (_jsx("a", { href: profile.linkedin, className: "block text-pink-600 dark:text-pink-400 hover:underline", children: "LinkedIn" })), profile?.website && (_jsx("a", { href: profile.website, className: "block text-pink-600 dark:text-pink-400 hover:underline", children: "Website" }))] }), _jsx(Button, { onClick: () => setEditing(true), variant: "primary", size: "md", className: "mt-4", children: "Edit Profile" })] })) : (_jsxs("form", { onSubmit: updateProfile, children: [_jsx("div", { className: "space-y-4", children: Object.entries(formData).map(([key, value]) => (_jsxs("div", { children: [_jsx("label", { className: "block mb-1 capitalize text-gray-700 dark:text-gray-300", children: key === 'linkedin' ? 'LinkedIn' : key }), key === 'bio' ? (_jsx("textarea", { name: key, value: value, onChange: handleInputChange, className: "w-full p-2 border rounded bg-white dark:bg-dark-700 \n                      text-gray-900 dark:text-white border-gray-300 dark:border-gray-600\n                      focus:ring-pink-500 focus:border-pink-500 dark:focus:ring-pink-400", rows: 3 })) : (_jsx("input", { type: key.includes('url') || key === 'github' || key === 'linkedin' || key === 'website' ? 'url' : 'text', name: key, value: value, onChange: handleInputChange, placeholder: getPlaceholder(key), className: "w-full p-2 border rounded bg-white dark:bg-dark-700 \n                      text-gray-900 dark:text-white border-gray-300 dark:border-gray-600\n                      focus:ring-pink-500 focus:border-pink-500 dark:focus:ring-pink-400" }))] }, key))) }), _jsxs("div", { className: "mt-6 space-x-4", children: [_jsx(Button, { type: "submit", variant: "primary", size: "md", disabled: loading, className: "relative", children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "opacity-0", children: "Save" }), _jsx("span", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("svg", { className: "animate-spin h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }) })] })) : ('Save') }), _jsx(Button, { type: "button", onClick: () => {
                                        setEditing(false);
                                        setError(null);
                                    }, variant: "ghost", size: "md", disabled: loading, children: "Cancel" })] })] })) })] }));
}
function getPlaceholder(key) {
    switch (key) {
        case 'github':
            return 'https://github.com/username';
        case 'linkedin':
            return 'https://linkedin.com/in/username';
        case 'website':
            return 'https://example.com';
        case 'company':
            return 'Current Company';
        default:
            return '';
    }
}
