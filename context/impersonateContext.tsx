"use client";

import { createContext, useContext, useState } from "react";

type ImpersonateContextType = {
  impersonateCourseId: string | null;
  setImpersonateCourseId: (id: string | null) => void;
};

const ImpersonateContext = createContext<ImpersonateContextType | null>(null);

export const ImpersonateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [impersonateCourseId, setImpersonateCourseId] = useState<string | null>(null);

  return (
    <ImpersonateContext.Provider
      value={{ impersonateCourseId, setImpersonateCourseId }}
    >
      {children}
    </ImpersonateContext.Provider>
  );
};

// hook
export const useImpersonate = () => {
  const context = useContext(ImpersonateContext);
  if (!context) {
    throw new Error("useImpersonate must be used within ImpersonateProvider");
  }
  return context;
};