// /lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Remplacez par vos informations d'identification Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Créez une instance du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
