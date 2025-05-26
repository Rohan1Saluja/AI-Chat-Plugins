"use client";

import { AppDispatch, store } from "@/store";
import { initializeAuth } from "@/store/auth/authSlice";
import { Analytics } from "@vercel/analytics/next";
import React from "react";
import { Provider, useDispatch } from "react-redux";

function AppAuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    console.log("Initializing Auth...");
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AppAuthInitializer>{children}</AppAuthInitializer>
      <Analytics />
    </Provider>
  );
}
