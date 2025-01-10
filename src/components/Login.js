import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
export function Login() {
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 \n    transition-colors duration-200", children: _jsxs("div", { className: "max-w-md w-full p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg", children: [_jsx("h1", { className: "text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white", children: "Welcome to Coderplex" }), _jsx(Auth, { supabaseClient: supabase, appearance: {
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: '#ff4081',
                                    brandAccent: '#ff80ab',
                                }
                            }
                        }
                    }, providers: ['github'] })] }) }));
}
