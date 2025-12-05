import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service_role を使う！
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
