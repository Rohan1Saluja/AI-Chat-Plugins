"use client";

import { AppDispatch, RootState } from "@/store";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { clearAuthError } from "@/store/auth/actions";

export default function AuthPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { user, error, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  React.useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch, user]);

  React.useEffect(() => {
    if (isInitialized && user) setTimeout(() => router.replace("/"), 600);
  }, [user, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Initializing Chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 w-full 2xl:max-w-4/5 mx-auto px-4 min-h-[58dvh] 2xl:min-h-[48dvh] py-10">
        <div className="w-full md:w-1/2">
          <LoginForm />
        </div>
        {/* Vertical separator for md+ screens */}
        <div className="hidden md:flex items-stretch">
          <div className="w-px bg-gray-500 h-full mx-6" />
        </div>
        <div className="w-full md:w-1/2">
          <SignUpForm />
        </div>
      </div>
      {user && (
        <button className="mt-6 px-6 py-2 text-white rounded-md bg-primary hover:bg-primary-600 hover:cursor-pointer">
          Go to Chat
        </button>
      )}
    </div>
  );
}
