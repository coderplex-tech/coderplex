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