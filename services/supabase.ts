
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase configuration.
 * The URL and Key are provided by the user for the GS Premium Collective project.
 */
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

/**
 * A "Safe" Supabase client. 
 * If the URL or Key is missing, it returns a Proxy that intercepts all calls.
 * This prevents the app from crashing on boot and allows it to fall back to mock data gracefully.
 */
// Added ': any' return type to prevent TypeScript from inferring '{}' from the Proxy
const createSafeClient = (): any => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '' || supabaseAnonKey === '') {
    console.warn(
      "Supabase configuration is incomplete. " +
      "Falling back to local mock data mode for development."
    );

    // Return a proxy that handles any property access without throwing errors
    const noOp: any = new Proxy({}, {
      get: (target, prop) => {
        return () => {
          console.warn(`Supabase call to ".${String(prop)}" ignored: Client not fully configured.`);
          return Promise.resolve({ data: null, error: { message: "Supabase not configured" } });
        };
      }
    });

    // Handle nested properties like .auth.getSession() and .from('table').select('*')
    return new Proxy({}, {
      get: (target, prop) => {
        if (prop === 'auth') return noOp;
        if (prop === 'from') return () => noOp;
        return noOp;
      }
    });
  }

  // Create the real client
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Explicitly type supabase as any to allow property access like .auth and .from in consumers
export const supabase: any = createSafeClient();

/**
 * Helper for generic database error handling.
 */
export const handleSupabaseError = (error: any) => {
  console.error("Supabase Operation Error:", error?.message || error);
  return error?.message || "An unexpected error occurred with the data collective.";
};
