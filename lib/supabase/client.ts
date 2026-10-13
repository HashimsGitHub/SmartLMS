import { createBrowserClient } from "@supabase/ssr";

function getSupabaseUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.Supabase_API_URL ||
    "https://noyojbnfyciyyusmskdi.supabase.co";
  // Strip any trailing /rest/v1 or /rest/v1/ from URL
  return rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.Supabase_Public_API_Key ||
    "sb_publishable_XE-kpwQdk1zKtzRDtmOVqw_D2Zq38Nm"
  );
}

export function createClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

