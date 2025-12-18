"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Key } from "lucide-react";
import { verify2FALogin, verifyBackupCode } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface TwoFactorLoginProps {
  email: string;
  onBack?: () => void;
}

export default function TwoFactorLogin({ email, onBack }: TwoFactorLoginProps) {
  const router = useRouter();
  const { login } = useAuth();
  
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [token, setToken] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (useBackupCode) {
        const response = await verifyBackupCode({ email, backupCode });
        const { token: authToken, user } = response.data;
        login(user, authToken);
        router.push("/dashboard");
      } else {
        const response = await verify2FALogin({ email, token });
        
        // After successful 2FA verification, complete the login
        if (response.data.verified) {
          const { token: authToken, user } = response.data;
          login(user, authToken);
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-gray-400">
                {useBackupCode
                  ? "Enter one of your backup codes"
                  : "Enter the 6-digit code from your authenticator app"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" onClose={() => setError("")}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerify2FA} className="space-y-4">
            {!useBackupCode ? (
              <div className="space-y-2">
                <Label htmlFor="token">Authentication Code</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="token"
                    type="text"
                    placeholder="123456"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pl-10 text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Open your authenticator app to get your code
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="backupCode">Backup Code</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="backupCode"
                    type="text"
                    placeholder="XXXXXXXX"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                    className="pl-10 font-mono"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Each backup code can only be used once
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify & Continue"
              )}
            </Button>
          </form>

          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setToken("");
                setBackupCode("");
                setError("");
              }}
              className="w-full"
            >
              {useBackupCode ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Use Authenticator Code
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Use Backup Code
                </>
              )}
            </Button>

            {onBack && (
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="w-full"
              >
                Back to Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
