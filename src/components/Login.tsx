import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 
    transition-colors duration-200">
      <div className="max-w-md w-full p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Welcome to Coderplex
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#ff4081',
                  brandAccent: '#ff80ab',
                }
              }
            }
          }}
          providers={['github']}
        />
      </div>
    </div>
  );
}
