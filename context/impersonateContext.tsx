"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
  const [impersonateCourseId, setImpersonateCourseIdState] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // ------------------------------
  // 初期：URL → state
  // ------------------------------
  useEffect(() => {
    const courseId = searchParams.get("course");

    if (courseId) {
      setImpersonateCourseIdState(courseId);
      localStorage.setItem("impersonateCourseId", courseId);
    } else {
      const saved = localStorage.getItem("impersonateCourseId");
      if (saved) {
        setImpersonateCourseIdState(saved);
      }
    }
  }, []);

  // ------------------------------
  // state → URL
  // ------------------------------
  const setImpersonateCourseId = (id: string | null) => {
    setImpersonateCourseIdState(id);

    if (id) {
      localStorage.setItem("impersonateCourseId", id);

      const params = new URLSearchParams(window.location.search);
      params.set("course", id);

      router.replace(`?${params.toString()}`);
    } else {
      localStorage.removeItem("impersonateCourseId");

      const params = new URLSearchParams(window.location.search);
      params.delete("course");

      router.replace(`?${params.toString()}`);
    }
  };

  return (
    <ImpersonateContext.Provider
      value={{ impersonateCourseId, setImpersonateCourseId }}
    >
      {children}
    </ImpersonateContext.Provider>
  );
};

export const useImpersonate = () => {
  const context = useContext(ImpersonateContext);
  if (!context) {
    throw new Error("useImpersonate must be used within ImpersonateProvider");
  }
  return context;
};