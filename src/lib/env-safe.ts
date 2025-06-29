// Safe environment variables - never crashes
export const env = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    NODE_ENV: import.meta.env.NODE_ENV || 'development',
    DEV: import.meta.env.DEV || false,
    PROD: import.meta.env.PROD || false,
};

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return env.SUPABASE_URL !== 'https://placeholder.supabase.co' &&
        env.SUPABASE_ANON_KEY !== 'placeholder-anon-key';
};

// Log environment status
if (env.DEV) {
    console.log('🔧 Environment Status:', {
        supabase: isSupabaseConfigured() ? '✅ Configured' : '❌ Missing',
        env: env.NODE_ENV
    });

    if (!isSupabaseConfigured()) {
        console.warn('⚠️ Supabase not configured');
        console.warn('📋 Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel');
    }
}

export default env; 