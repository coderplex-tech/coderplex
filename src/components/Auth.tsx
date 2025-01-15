import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

const navigate = useNavigate();

const handleAuthCallback = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', session.user.id)
      .single();

    if (data?.onboarding_completed) {
      navigate('/community');
    } else {
      navigate('/onboarding');
    }
  }
};

useEffect(() => {
  // Handle the email confirmation redirect
  const { hash } = window.location;
  if (hash && hash.includes('access_token')) {
    handleAuthCallback();
  }
}, []); 

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (user) {
      // Create profile with onboarding completed for existing users
      await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: user.email?.split('@')[0] || 'User',
          role: 'Member',
          employment_status: 'employed',
          looking_for_work: false,
          followers_count: 0,
          following_count: 0,
          onboarding_completed: true  // Set this to true for existing users
        });
    }

    setMessage('Check your email for the confirmation link');
  } catch (error) {
    console.error(error);
    setMessage((error as Error).message);
  }
}; 