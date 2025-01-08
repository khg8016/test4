import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
const DEBUG = true;
export const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[Supabase] ${message}`, data || '');
  }
};

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const configured = Boolean(supabaseUrl && supabaseAnonKey);
  log(`Supabase configuration status: ${configured}`);
  return configured;
}

// Only create the client if credentials are available
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Set up auth state change listener
if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      // Clear any auth related storage
      localStorage.removeItem('supabase.auth.token');
      // Redirect to login page
      window.location.href = '/login';
    } else if (event === 'TOKEN_REFRESHED') {
      log('Session token refreshed');
    }
  });

  // Add response interceptor to handle auth errors
  const { fetch: originalFetch } = window;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      if (response.status === 401 || response.status === 403) {
        const data = await response.clone().json();
        if (data?.error?.message?.includes('JWT')) {
          // Session is invalid, sign out
          await supabase.auth.signOut();
          window.location.href = '/login';
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  log('Supabase client initialized with auth handling');
} else {
  log('Failed to initialize Supabase client');
}