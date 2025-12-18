"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Key, Mail, Bell } from "lucide-react";
import TwoFactorSetup, { DisableTwoFactor } from "@/components/auth/TwoFactorSetup";
import { useAuth } from "@/context/AuthContext";

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false); // Initialize from user context

  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      setShow2FADisable(true);
    } else {
      setShow2FASetup(true);
    }
  };

  const handle2FASuccess = () => {
    setShow2FASetup(false);
    setShow2FADisable(false);
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  if (show2FASetup) {
    return <TwoFactorSetup onSuccess={handle2FASuccess} />;
  }

  if (show2FADisable) {
    return <DisableTwoFactor onSuccess={handle2FASuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
          <p className="text-gray-400">Manage your account security and privacy settings</p>
        </div>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription className="mt-1">
                    Add an extra layer of security to your account by requiring a verification code
                    in addition to your password when signing in.
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleToggle2FA}
              />
            </div>
          </CardHeader>
          {twoFactorEnabled && (
            <CardContent>
              <Alert variant="success">
                <AlertDescription>
                  Two-factor authentication is currently <strong>enabled</strong> on your account.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Lock className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <CardTitle>Password</CardTitle>
                <CardDescription className="mt-1">
                  Change your password regularly to keep your account secure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>

        {/* Login Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Key className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription className="mt-1">
                  Manage and monitor devices where you&apos;re currently logged in
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">Current Device</p>
                  <p className="text-sm text-gray-400">Last active: Just now</p>
                </div>
                <Button variant="ghost" size="sm">Revoke</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Mail className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription className="mt-1">
                    Receive security alerts and notifications about your account activity
                  </CardDescription>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardHeader>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Bell className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <CardTitle>Security Alerts</CardTitle>
                  <CardDescription className="mt-1">
                    Get notified about suspicious login attempts and account changes
                  </CardDescription>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardHeader>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Activity</CardTitle>
            <CardDescription>
              Review recent security events on your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Lock className="h-4 w-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Password changed</p>
                  <p className="text-xs text-gray-400">2 days ago • Chrome on Windows</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">2FA enabled</p>
                  <p className="text-xs text-gray-400">1 week ago • Chrome on Windows</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
