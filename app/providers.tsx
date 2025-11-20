// app/providers.tsx
"use client";

import { createContext, useContext, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface ProvidersProps {
  children: React.ReactNode;
}

const SupabaseContext = createContext<any>(null);

export function Providers({ children }: ProvidersProps) {
  const [supabase] = useState(() => createClient());
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  return useContext(SupabaseContext).supabase;
}
