"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { AuthProvider } from "@/context/AuthContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
};
