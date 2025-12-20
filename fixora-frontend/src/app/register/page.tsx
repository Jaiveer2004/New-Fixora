// Enhanced register page with modern design and navbar
"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { Navbar } from "@/components/shared/Navbar";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4">
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 animate-fadeIn">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <span className="text-black font-bold text-lg sm:text-xl">F</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join Fixora</h1>
              <p className="text-sm sm:text-base text-gray-500">Create your account to get started</p>
            </div>

            {/* Register Form Card */}
            <div className="bg-black/50 rounded-xl sm:rounded-2xl border border-gray-900 p-6 sm:p-8 shadow-2xl animate-scaleIn">
              <RegisterForm />
              
              {/* Divider */}
              <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-900 text-center">
                <p className="text-gray-500 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-white hover:text-gray-300 font-medium transition-colors touch-feedback">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-gray-600 text-xs">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}