"use client";

import { createContext, useContext, ReactNode } from "react";

export type AdminRole =
  | "superadmin"
  | "segretario_provinciale"
  | "resp_comunicazione"
  | "resp_tesseramento"
  | "resp_comunale";

interface AdminContextValue {
  role: AdminRole | null;
  realRole: AdminRole | null;
  municipalityId: string | null;
  isImpersonating: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  role: null,
  realRole: null,
  municipalityId: null,
  isImpersonating: false,
});

export function AdminProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AdminContextValue;
}) {
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdminContext() {
  return useContext(AdminContext);
}
