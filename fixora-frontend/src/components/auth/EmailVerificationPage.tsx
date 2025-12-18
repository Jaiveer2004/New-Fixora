"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";
import { verifyEmail, resendVerificationEmail } from "@/services/authService";
import { useRouter, useSearchParams } from "next/navigation";

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyEmailToken = async () => {
      const token = searchParams.get("token");
      const code = searchParams.get("code");
      const userEmail = searchParams.get("email");

      if (userEmail) setEmail(userEmail);

      if (!token || !code) {
        setStatus("error");
        setMessage("Invalid verification link. Please check your email and try again.");
        return;
      }

      try {
        const response = await verifyEmail({ token, code });
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed. The link may have expired.");
      }
    };

    verifyEmailToken();
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    if (!email) {
      setMessage("Email address not found. Please register again.");
      return;
    }

    setIsResending(true);
    try {
      const response = await resendVerificationEmail({ email });
      setMessage(response.data.message || "Verification email sent! Please check your inbox.");
      setStatus("success");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to resend verification email.");
      setStatus("error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {status === "loading" && <Loader2 className="h-8 w-8 text-white animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-8 w-8 text-white" />}
            {status === "error" && <XCircle className="h-8 w-8 text-white" />}
          </div>
          <CardTitle className="text-3xl font-bold">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your email address"}
            {status === "success" && "Your account has been successfully verified"}
            {status === "error" && "We couldn't verify your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={status === "success" ? "success" : status === "error" ? "destructive" : "default"}>
            <AlertTitle className="flex items-center gap-2">
              {status === "success" && <CheckCircle2 className="h-4 w-4" />}
              {status === "error" && <XCircle className="h-4 w-4" />}
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === "loading" ? "Processing..." : status === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription className="mt-2">
              {message}
            </AlertDescription>
          </Alert>

          {status === "success" && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                Redirecting to login page in 3 seconds...
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={isResending || !email}
                className="w-full"
              >
                {isResending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    Resend Verification Email
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/register")}
                className="w-full"
              >
                Back to Registration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
