import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const metaEnv = (import.meta as unknown as { env: Record<string, string> }).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || "https://pbbtiazbpolvajjsqirs.supabase.co";
const supabaseKey = metaEnv.VITE_SUPABASE_ANON_KEY || "sb_publishable_FnEN-7WZtC0_qvoNApQNSw__c9KqANV";

export const createClient = () => createSupabaseClient(supabaseUrl, supabaseKey);
