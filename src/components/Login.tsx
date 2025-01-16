import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navbar } from './Navbar';

export function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const location = useLocation();

  useEffect(() => {
    // Get the auth view from URL parameters
    const params = new URLSearchParams(location.search);
    const authView = params.get('auth-view');
    if (authView === 'sign_up') {
      setView('sign_up');
    } else {
      setView('sign_in');
    }
  }, [location]);

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/community');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        if (session) {
          const { user } = session;
          
          // Check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select()
            .eq('user_id', user.id)
            .single();

          if (!profile) {
            // Create new profile if it doesn't exist
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  user_id: user.id,
                  name: user.user_metadata.full_name || user.user_metadata.name || '',
                  avatar_url: user.user_metadata.avatar_url || null,
                  onboarding_completed: false,
                  is_student: false,
                  is_employed: false,
                  is_freelance: false,
                }
              ]);

            if (profileError) {
              console.error('Error creating profile:', profileError);
            }
          }
        }
        navigate('/community');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-200 dark:bg-dark-900">
      <Navbar isPublic />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm 
        rounded-lg shadow-lg p-4 md:p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              Welcome to Coderplex
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {view === 'sign_up' 
                ? "Create an account to join our developer community"
                : "Sign in to connect with our developer community"
              }
            </p>
          </div>
          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#3b82f6',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f3f4f6',
                    defaultButtonBackgroundHover: '#e5e7eb',
                    inputBackground: 'transparent',
                    inputBorder: '#d1d5db',
                    inputBorderHover: '#2563eb',
                    inputBorderFocus: '#2563eb',
                    inputText: '#111827',
                    messageText: '#6b7280',
                    anchorTextColor: '#2563eb',
                    dividerBackground: '#e5e7eb',
                    inputLabelText: '#4b5563',
                  },
                  space: {
                    buttonPadding: '0.625rem 1.25rem',
                    inputPadding: '0.625rem 1rem',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
                dark: {
                  colors: {
                    inputLabelText: '#e5e7eb',
                    inputText: '#f9fafb',
                  },
                },
              },
              style: {
                button: {
                  fontWeight: '600',
                  fontSize: '15px',
                  border: '1px solid transparent',
                  transition: 'all 200ms ease',
                },
                anchor: {
                  color: '#2563eb',
                  fontWeight: '500',
                  transition: 'color 200ms ease',
                },
                container: {
                  gap: '20px',
                },
                label: {
                  color: 'var(--colors-labelText)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                },
                input: {
                  backgroundColor: 'transparent',
                  borderColor: '#d1d5db',
                  color: 'var(--colors-inputText)',
                },
                message: {
                  color: '#6b7280',
                  fontSize: '0.875rem',
                },
                divider: {
                  background: '#e5e7eb',
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
            providers={['github', 'google']}
            showLinks={true}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in ...',
                  social_provider_text: "Continue with {{provider}}",
                  link_text: "Already have an account? Sign in"
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create a Password',
                  email_input_placeholder: 'Your email address',
                  password_input_placeholder: 'Your password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up ...',
                  social_provider_text: "Sign up with {{provider}}",
                  link_text: "Don't have an account? Sign up"
                },
                forgotten_password: {
                  link_text: 'Forgot your password?',
                  email_label: 'Email address',
                  password_label: 'Password',
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send reset instructions',
                  loading_button_label: 'Sending reset instructions ...',
                  confirmation_text: 'Check your email for the password reset link'
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
