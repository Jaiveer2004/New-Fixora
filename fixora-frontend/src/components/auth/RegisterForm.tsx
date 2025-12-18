// Enhanced registration form with modern design and better UX

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/services/apiService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GoogleLoginButton from "./GoogleLoginButton";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);

    try {
      // Use the dedicated service function
      const promise = registerUser({ fullName, email, password, role });

      await toast.promise(promise, {
        loading: 'Creating your account...',
        success: (response) => {
          login(response.data.user, response.data.token);

          // Redirect based on role
          if (role === 'partner') {
            router.push('/partner/onboard');
          } else {
            router.push('/dashboard');
          }

          return <b>Welcome to Fixora!</b>;
        },
        error: (err) => {
          const errorMessage = err instanceof Error && 'response' in err &&
            err.response && typeof err.response === 'object' &&
            'data' in err.response && err.response.data &&
            typeof err.response.data === 'object' && 'message' in err.response.data
            ? String(err.response.data.message)
            : "Registration failed!";
          return <b>{errorMessage}</b>;
        },
      });
    } catch (error) {
      console.error("Registration process failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '' };
    if (password.length < 6) return { strength: 1, text: 'Weak' };
    if (password.length < 10) return { strength: 2, text: 'Medium' };
    return { strength: 3, text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <GoogleLoginButton text="Sign up with Google" />
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      {/* Role Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">
          Join as
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`p-4 rounded-lg border transition-all duration-200 ${role === 'customer'
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
              }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <div className="font-medium">Customer</div>
                <div className="text-xs opacity-75">Book services</div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRole('partner')}
            className={`p-4 rounded-lg border transition-all duration-200 ${role === 'partner'
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
              }`}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <div>
                <div className="font-medium">Partner</div>
                <div className="text-xs opacity-75">Offer services</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Full Name Field */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium text-white">
          Full Name
        </label>
        <Input
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-white">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-white">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Password strength</span>
              <span className={`${passwordStrength.strength === 1 ? 'text-red-400' :
                  passwordStrength.strength === 2 ? 'text-yellow-400' :
                    'text-green-400'
                }`}>
                {passwordStrength.text}
              </span>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${passwordStrength.strength >= level
                      ? passwordStrength.strength === 1 ? 'bg-red-400' :
                        passwordStrength.strength === 2 ? 'bg-yellow-400' :
                          'bg-green-400'
                      : 'bg-gray-600'
                    }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className={`pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
              }`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-red-400 text-xs">Passwords don&apos;t match</p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 rounded mt-0.5"
        />
        <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
          I agree to the{' '}
          <a href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
            Privacy Policy
          </a>
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
        disabled={isLoading || password !== confirmPassword}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </div>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}