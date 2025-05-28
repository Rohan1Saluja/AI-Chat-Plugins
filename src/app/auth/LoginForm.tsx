"use client";

import { AppDispatch, RootState } from "@/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2 } from "lucide-react";
import { clearAuthError, signInWithCredentials } from "@/store/auth/actions";

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, user } = useSelector(
    // Get user instead of session for this
    (state: RootState) => state.auth
  );

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    // Clear error when component mounts
    dispatch(clearAuthError());
    // Effect to show success message briefly if login was successful (session appears)
    // This is optional, as redirection usually handles it.

    if (user && !isLoading && !error && !successMessage) {
      setSuccessMessage("Login successful!");
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      // Cleanup on unmount
      dispatch(clearAuthError());
      setSuccessMessage(null);
    };
  }, [dispatch, user, isLoading, error, successMessage]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearAuthError());
    setSuccessMessage(null);
    dispatch(signInWithCredentials({ email, password }));
  };

  return (
    <form
      onSubmit={handleLogin}
      className="prose flex flex-col space-y-3 px-6 py-6 bg-background-700 rounded-xl shadow-lg h-full" // Consistent styling with SignUpForm
    >
      <h3 className="text-primary text-center !mb-6 flex items-center justify-center gap-2">
        <LogIn size={28} strokeWidth={2.5} /> Login
      </h3>
      {/* Error and Success Message Display */}
      {error && (
        <div className="flex items-center justify-center text-red-400 text-sm p-2 bg-red-900/30 rounded-md gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {successMessage && (
        <div className="flex items-center justify-center text-green-400 text-sm p-2 bg-green-900/30 rounded-md gap-2">
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}
      {/* Email Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail size={18} className="text-gray-400" />
        </div>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full pl-10 pr-3 py-2.5 border border-background-600 rounded-lg bg-background-800 text-textColor-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors shadow-sm placeholder-gray-500"
          placeholder="Enter your email"
        />
      </div>
      {/* Password Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock size={18} className="text-gray-400" />
        </div>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full pl-10 pr-3 py-2.5 border border-background-600 rounded-lg bg-background-800 text-textColor-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors shadow-sm placeholder-gray-500"
          placeholder="Enter your password"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full mt-6 py-2.5 px-4 rounded-lg font-semibold shadow-md transition-colors flex items-center justify-center gap-2 ${
          isLoading
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-primary hover:bg-primary-600 text-white hover:cursor-pointer" // Using primary color for login
        }`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <LogIn size={20} />
        )}
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
