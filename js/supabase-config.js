/* =========================================================
   JT SERVICE — Configuration Supabase
   =========================================================
   Remplissez les deux valeurs ci-dessous avec celles de votre
   projet Supabase : Project Settings → API.
   - SUPABASE_URL   → "Project URL"
   - SUPABASE_ANON_KEY → "anon public" key (JAMAIS la clé "service_role")
   Ce sont des informations publiques par conception : la clé "anon"
   est prévue pour être visible dans le code du site. La sécurité
   réelle est assurée par les règles RLS définies dans schema.sql.
   ========================================================= */

const SUPABASE_URL = "https://VOTRE-PROJET.supabase.co";
const SUPABASE_ANON_KEY = "VOTRE_CLE_ANON_PUBLIC";

// Ne pas modifier en dessous de cette ligne -----------------
const jtsSupabase = (SUPABASE_URL.includes("VOTRE-PROJET") || SUPABASE_ANON_KEY.includes("VOTRE_CLE"))
  ? null
  : window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (!jtsSupabase) {
  console.warn("[JT Service] Supabase n'est pas encore configuré — voir js/supabase-config.js");
}
