"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Copy, Check, Download, Lock } from "lucide-react";
import { enable2FA, verify2FA, disable2FA } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

interface TwoFactorSetupProps {
  onSuccess?: () => void;
}

export default function TwoFactorSetup({ onSuccess }: TwoFactorSetupProps) {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState<"setup" | "verify" | "complete">("setup");
  const [qrCode, setQRCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const handleEnable2FA = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await enable2FA({ userId: user.id });
      const { qrCode: qr, secret: sec, backupCodes: codes } = response.data;
      
      setQRCode(qr);
      setSecret(sec);
      setBackupCodes(codes);
      setStep("verify");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await verify2FA({ token });
      setSuccess(response.data.message || "2FA enabled successfully!");
      setStep("complete");
      
      // Update user context with 2FA enabled status
      updateUser({ twoFactorEnabled: true });
      
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Invalid token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "secret" | "backup") => {
    navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fixora-2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === "setup") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="font-semibold text-white">What is 2FA?</h4>
            <p className="text-sm text-gray-400">
              Two-factor authentication adds an extra layer of security by requiring a second
              verification method in addition to your password. You&apos;ll need an authenticator
              app like Google Authenticator or Authy.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white">Before you begin:</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Install an authenticator app on your phone</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Keep your backup codes in a safe place</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>You&apos;ll need a 6-digit code every time you log in</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleEnable2FA}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Setting up..." : "Enable 2FA"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "verify") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Scan QR Code</CardTitle>
          <CardDescription>
            Use your authenticator app to scan the QR code or enter the secret manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center space-y-4">
            {qrCode && (
              <div className="p-4 bg-white rounded-lg">
                <Image
                  src={qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="w-48 h-48"
                />
              </div>
            )}

            <div className="w-full space-y-2">
              <Label>Secret Key (Manual Entry)</Label>
              <div className="flex gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(secret, "secret")}
                >
                  {copiedSecret ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h4 className="font-semibold text-yellow-200">Backup Codes</h4>
                <p className="text-sm text-yellow-300/80">
                  Save these codes in a safe place. You can use them to access your account if you lose your device.
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-gray-900/50 p-3 rounded">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="text-gray-300">{code}</div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(backupCodes.join("\n"), "backup")}
                    className="flex-1"
                  >
                    {copiedBackup ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadBackupCodes}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Enter 6-Digit Code</Label>
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
            </div>

            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? "Verifying..." : "Verify & Enable 2FA"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === "complete") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-green-500/10 rounded-full">
              <Check className="h-12 w-12 text-green-400" />
            </div>
            <CardTitle className="text-2xl">2FA Enabled Successfully!</CardTitle>
            <CardDescription>
              Your account is now protected with two-factor authentication
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert variant="success">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Disable 2FA Component
export function DisableTwoFactor({ onSuccess }: TwoFactorSetupProps) {
  const { updateUser } = useAuth();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await disable2FA({ password });
      
      // Update user context with 2FA disabled status
      updateUser({ twoFactorEnabled: false });
      
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-red-400">Disable Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter your password to disable 2FA on your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleDisable} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="destructive"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Disabling..." : "Disable 2FA"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
