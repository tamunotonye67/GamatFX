import { createClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as unknown as { env: Record<string, string> }).env || {};
export const supabaseUrl = metaEnv.VITE_SUPABASE_URL || "https://pbbtiazbpolvajjsqirs.supabase.co";
export const supabaseKey = metaEnv.VITE_SUPABASE_ANON_KEY || "sb_publishable_FnEN-7WZtC0_qvoNApQNSw__c9KqANV";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
