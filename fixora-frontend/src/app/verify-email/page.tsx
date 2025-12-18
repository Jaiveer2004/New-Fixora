import { Suspense } from "react";
import EmailVerificationPage from "@/components/auth/EmailVerificationPage";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EmailVerificationPage />
    </Suspense>
  );
}
