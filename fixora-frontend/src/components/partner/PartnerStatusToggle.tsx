"use client";

import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { PartnerStatusToggleSkeleton } from "./PartnerStatusToggleSkeleton";
import { getPartnerProfile, updatePartnerStatus } from "@/services/apiService";
import toast from "react-hot-toast";

export function PartnerStatusToggle() {
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPartnerProfile()
      .then((res) => {
        console.log("Partner profile fetched:", res.data);
        setIsOnline(res.data.isOnline);
      })
      .catch((err) => {
        console.error("Failed to fetch partner status", err);
        // Check if this is an authentication issue
        if (err?.response?.status === 401) {
          console.error("Authentication issue - user may need to log in again");
        } else if (err?.response?.status === 404) {
          console.error("Partner profile not found - user may need to complete onboarding");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (checked: boolean) => {
    const previousStatus = isOnline;
    setIsOnline(checked); 

    try {
      // Use the dedicated service function
      const promise = updatePartnerStatus({ isOnline: checked });

      await toast.promise(promise, {
        loading: `Switching to ${checked ? 'Online' : 'Offline'}...`,
        success: () => {
          return <b>Status updated to {checked ? 'Online' : 'Offline'}!</b>;
        },
        error: (err) => {
          setIsOnline(previousStatus); // Revert on error
          console.error("Detailed error:", err);
          
          let errorMessage = "Failed to set status";
          
          if (err?.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err?.message) {
            errorMessage = err.message;
          } else if (err?.response?.status === 404) {
            errorMessage = "Partner profile not found. Please complete your onboarding.";
          } else if (err?.response?.status === 403) {
            errorMessage = "Access denied. Only partners can change status.";
          } else if (err?.response?.status === 401) {
            errorMessage = "Please log in again to continue.";
          }
          
          return <b>{errorMessage}</b>;
        },
      });
    } catch (error) {
      console.error("Status update failed", error);
      setIsOnline(previousStatus); // Revert on error
      toast.error("Failed to set status");
    }
  };

  if (isLoading) return <PartnerStatusToggleSkeleton />;

  return (
    <div className="flex items-center space-x-3 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
      <Switch id="online-status" checked={isOnline} onCheckedChange={handleToggle} />
      <label htmlFor="online-status" className="font-medium text-white">
        You are currently <span className={`${isOnline ? 'text-green-400' : 'text-red-400'} font-semibold`}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </label>
    </div>
  );

}