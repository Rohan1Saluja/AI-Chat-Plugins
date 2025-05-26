"use client";

import { AppDispatch, RootState } from "@/store";
import { clearAuthError, SignUpwithCredentials } from "@/store/auth/authSlice";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  UserPlus,
} from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

export default function SignUpForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [retypePassword, setRetypePassword] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      setMessage(null);
    };
  }, [dispatch]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearAuthError());
    setMessage(null);
    const resultAction = await dispatch(
      SignUpwithCredentials({ email, password })
    );

    if (SignUpwithCredentials.fulfilled.match(resultAction)) {
      if (resultAction.payload.session)
        setMessage("Sign up successful! You're now logged in.");
      else if (
        resultAction.payload.user &&
        resultAction.payload.user.identities?.length === 0
      )
        setMessage(
          "User already exists and needs to confirm their email. Please check your inbox."
        );
      else
        setMessage(
          "Sign up successful! Please check your email to confirm your account."
        );
    }
  };

  const passwordMismatch =
    !!password && !!retypePassword && password !== retypePassword;

  return (
    <form
      onSubmit={handleSignUp}
      className="prose flex flex-col space-y-3 px-6 py-6 bg-background-700 rounded-xl shadow-lg h-full" // Increased padding, rounded-xl, space-y-3
    >
      <h3 className="text-secondary text-center !mb-6 flex items-center justify-center gap-2">
        <UserPlus size={28} strokeWidth={2.5} /> Sign Up
      </h3>
      {/* Error and Message Display */}
      {error && (
        <div className="flex items-center justify-center text-red-400 text-sm p-2 bg-red-900/30 rounded-md gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {message && (
        <div className="flex items-center justify-center text-green-400 text-sm p-2 bg-green-900/30 rounded-md gap-2">
          <CheckCircle2 size={18} /> {message}
        </div>
      )}
      {/* Email Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail size={18} className="text-gray-400" />
        </div>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full pl-10 pr-3 py-2.5 border border-background-600 rounded-lg bg-background-800 text-textColor-100 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors shadow-sm placeholder-gray-500"
          placeholder="Enter your email"
        />
      </div>
      {/* Password Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock size={18} className="text-gray-400" />
        </div>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full pl-10 pr-3 py-2.5 border border-background-600 rounded-lg bg-background-800 text-textColor-100 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors shadow-sm placeholder-gray-500"
          placeholder="Choose your password"
        />
      </div>
      {/* Retype Password Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <KeyRound size={18} className="text-gray-400" />
        </div>
        <input
          id="signup-retype-password"
          type="password"
          value={retypePassword}
          onChange={(e) => setRetypePassword(e.target.value)}
          required
          className={`w-full pl-10 pr-3 py-2.5 border rounded-lg bg-background-800 text-textColor-100 focus:outline-none focus:ring-2  focus:border-secondary transition-colors shadow-sm placeholder-gray-500 ${
            passwordMismatch
              ? "border-red-500 ring-red-500"
              : "border-background-600 focus:ring-secondary"
          }`}
          placeholder="Retype your password"
        />
      </div>
      {/* Password Mismatch Message */}
      <div className="h-5 text-center">
        {" "}
        {/* Fixed height to prevent layout shift */}
        {passwordMismatch && (
          <p className="text-red-400 text-xs flex items-center justify-center gap-1">
            <AlertCircle size={14} /> Passwords do not match.
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || passwordMismatch}
        className={`w-full py-2.5 px-4 rounded-lg font-semibold shadow-md transition-colors flex items-center justify-center gap-2 ${
          isLoading || passwordMismatch
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-secondary hover:bg-secondary-600 text-white hover:cursor-pointer"
        }`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <LogIn size={20} />
        )}
        {isLoading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
