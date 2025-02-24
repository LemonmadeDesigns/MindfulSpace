import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Add a connection status check function
export const checkSupabaseConnection = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // If no session, try a lightweight query
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Set up session refresh handler
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    // Clear any cached data if needed
    console.log('User signed out');
  }
});