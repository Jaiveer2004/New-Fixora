"use client";

import { useEffect, useState } from "react";

interface FixoraLoaderProps {
  onLoadingComplete: () => void;
}

export function FixoraLoader({ onLoadingComplete }: FixoraLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = [
    "Loading",
    "Connecting", 
    "Preparing",
    "Ready"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + Math.random() * 12 + 3;
        
        // Update current step based on progress
        const stepIndex = Math.floor((newProgress / 100) * loadingSteps.length);
        setCurrentStep(Math.min(stepIndex, loadingSteps.length - 1));
        
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onLoadingComplete();
          }, 300);
          return 100;
        }
        return newProgress;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onLoadingComplete, loadingSteps.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
          </div>
          <h1 className="text-2xl font-light text-white tracking-wide">
            Fixora
          </h1>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto">
            {/* Background Circle */}
            <div className="absolute inset-0 rounded-full border border-gray-700"></div>
            
            {/* Progress Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                className="text-blue-500 transition-all duration-300 ease-out"
                style={{
                  strokeDasharray: `${2 * Math.PI * 45}`,
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
                }}
              />
            </svg>

            {/* Center Percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-300 mb-2">
            {loadingSteps[currentStep]}
          </p>
          
          {/* Progress Bar */}
          <div className="w-48 mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-0.5">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Minimal Dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse animation-delay-400"></div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}