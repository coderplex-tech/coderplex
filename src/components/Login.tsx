import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/community');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent 
    transition-colors duration-200 px-4">
      <div className="w-full max-w-md bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm 
      rounded-lg shadow-lg p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Welcome to Coderplex
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#3b82f6',
                  inputText: 'black',
                  inputBackground: 'white',
                  inputBorder: 'lightgray',
                  inputLabelText: '#374151',
                },
                fonts: {
                  bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                  buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`,
                },
                fontSizes: {
                  baseBodySize: '15px',
                  baseInputSize: '15px',
                  baseLabelSize: '15px',
                  baseButtonSize: '15px',
                }
              },
            },
            style: {
              button: {
                fontWeight: '600',
              },
              anchor: {
                color: '#6b7280',
                fontSize: '14px',
              },
              message: {
                fontWeight: '600',
                color: '#374151',
              },
              label: {
                fontWeight: '600',
                color: '#374151',
              },
              container: {
                gap: '12px',
              },
              divider: {
                marginTop: '1.5rem',
                marginBottom: '1.5rem',
              },
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              anchor: 'auth-anchor',
              divider: 'auth-divider',
              label: 'auth-label',
              input: 'auth-input',
              message: 'auth-message',
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Login',
                loading_button_label: 'Logging in...',
                social_provider_text: 'Continue with {{provider}}',
                link_text: 'Already have an account? Login',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Create Account',
                loading_button_label: 'Creating account...',
                social_provider_text: 'Continue with {{provider}}',
                link_text: "Don't have an account? Create one",
              },
              forgotten_password: {
                link_text: 'Forgot password?',
              },
            },
          }}
          providers={['github']}
          view="sign_in"
        />
      </div>
    </div>
  );
}
