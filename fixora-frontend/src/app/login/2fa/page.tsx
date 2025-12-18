"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TwoFactorLogin from "@/components/auth/TwoFactorLogin";

function TwoFactorPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      // If no email, redirect back to login
      router.push("/login");
      return;
    }
    setEmail(emailParam);
  }, [searchParams, router]);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <TwoFactorLogin 
      email={email} 
      onBack={() => router.push("/login")} 
    />
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <TwoFactorPageContent />
    </Suspense>
  );
}
