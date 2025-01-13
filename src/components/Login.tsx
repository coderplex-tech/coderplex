import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();

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
        // Create a profile for new users
        if (session) {
          const { user } = session;
          const { data: profile } = await supabase
            .from('profiles')
            .select()
            .eq('user_id', user.id)
            .single();

          if (!profile) {
            // Create new profile if it doesn't exist
            const { error } = await supabase.from('profiles').insert([
              {
                user_id: user.id,
                name: user.user_metadata.full_name || user.user_metadata.name || 'New User',
                avatar_url: user.user_metadata.avatar_url,
                // Handle provider-specific metadata
                github: user.app_metadata.provider === 'github' 
                  ? `https://github.com/${user.user_metadata.user_name}`
                  : null,
                // Add Google-specific data
                website: user.app_metadata.provider === 'google' && user.user_metadata.picture
                  ? user.user_metadata.picture
                  : null,
                // You can also add email if needed (requires email scope)
                // email: user.email,
              }
            ]);

            if (error) console.error('Error creating profile:', error);
          }
        }
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
                },
              },
            },
            style: {
              button: {
                fontWeight: '600',
                fontSize: '15px',
              },
              container: {
                gap: '20px',
              },
            },
          }}
          providers={['github', 'google']}
          view="sign_in"
          showLinks={false}
          localization={{
            variables: {
              sign_in: {
                social_provider_text: "Continue with {{provider}}"
              },
            },
          }}
        />
      </div>
    </div>
  );
}
