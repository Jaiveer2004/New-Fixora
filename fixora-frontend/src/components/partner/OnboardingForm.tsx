// Enhanced partner onboarding form with modern design and better UX

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPartnerProfile } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const serviceCategories = [
  'Plumbing', 'Electrical', 'Cleaning', 'Home Repair', 'Appliance Repair',
  'HVAC', 'Painting', 'Gardening', 'Moving', 'Pest Control', 'IT Support',
  'Tutoring', 'Personal Training', 'Beauty & Wellness', 'Event Planning',
  'Photography', 'Catering', 'Pet Care', 'Automotive', 'Other'
];

export function OnboardingForm() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    bio: '',
    skillsAndExpertise: [] as string[],
    experienceYears: '',
    phoneNumber: '',
    serviceAreas: '',
    priceRange: 'budget', // budget, standard, premium
    availability: 'flexible' // flexible, weekdays, weekends, evenings
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skillsAndExpertise: prev.skillsAndExpertise.includes(skill)
        ? prev.skillsAndExpertise.filter(s => s !== skill)
        : [...prev.skillsAndExpertise, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const promise = createPartnerProfile({
        bio: formData.bio,
        skillsAndExpertise: formData.skillsAndExpertise,
        experienceYears: Number(formData.experienceYears),
        phoneNumber: formData.phoneNumber,
        serviceAreas: formData.serviceAreas.split(',').map(s => s.trim()),
        priceRange: formData.priceRange,
        availability: formData.availability
      });

      await toast.promise(promise, {
        loading: 'Setting up your partner profile...',
        success: () => {
          // Update user role in auth context
          if (user) {
            const updatedUser = { ...user, role: 'partner' };
            const currentToken = localStorage.getItem('authToken') || '';
            login(updatedUser, currentToken);
          }
          
          router.push('/dashboard');
          return <b>Welcome to Fixora! Your partner profile is now active.</b>;
        },
        error: (err) => <b>{err.response?.data?.message || "Profile setup failed!"}</b>,
      });
    } catch (error) {
      console.error("Onboarding process failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Tell us about yourself</h3>
        <p className="text-gray-400 mb-6">Share your professional background and experience</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium text-white">
          Professional Bio
        </label>
        <Textarea
          id="bio"
          placeholder="Describe your professional background, specialties, and what makes you stand out..."
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          required
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-gray-500">This will be shown to customers when they view your profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="experience" className="text-sm font-medium text-white">
            Years of Experience
          </label>
          <Input
            id="experience"
            type="number"
            min="0"
            max="50"
            placeholder="5"
            value={formData.experienceYears}
            onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-white">
            Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phoneNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="areas" className="text-sm font-medium text-white">
          Service Areas
        </label>
        <Input
          id="areas"
          placeholder="Mumbai, Pune, Thane (comma separated)"
          value={formData.serviceAreas}
          onChange={(e) => setFormData(prev => ({ ...prev, serviceAreas: e.target.value }))}
          required
        />
        <p className="text-xs text-gray-500">List the cities or areas where you provide services</p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Your Skills & Services</h3>
        <p className="text-gray-400 mb-6">Select the services you can provide</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {serviceCategories.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => handleSkillToggle(skill)}
              className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                formData.skillsAndExpertise.includes(skill)
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
        {formData.skillsAndExpertise.length === 0 && (
          <p className="text-red-400 text-sm">Please select at least one skill</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-white">Price Range</label>
          <div className="space-y-2">
            {[
              { value: 'budget', label: 'Budget Friendly', desc: '₹200-500/hour' },
              { value: 'standard', label: 'Standard', desc: '₹500-1000/hour' },
              { value: 'premium', label: 'Premium', desc: '₹1000+/hour' }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  value={option.value}
                  checked={formData.priceRange === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <div>
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-white">Availability</label>
          <div className="space-y-2">
            {[
              { value: 'flexible', label: 'Flexible', desc: 'Available anytime' },
              { value: 'weekdays', label: 'Weekdays Only', desc: 'Monday to Friday' },
              { value: 'weekends', label: 'Weekends Only', desc: 'Saturday & Sunday' },
              { value: 'evenings', label: 'Evenings Only', desc: 'After 6 PM' }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  value={option.value}
                  checked={formData.availability === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <div>
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-400">Step {currentStep} of 2</span>
          <span className="text-sm font-medium text-gray-400">{currentStep === 1 ? 'Basic Info' : 'Skills & Preferences'}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 1 ? renderStep1() : renderStep2()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={isLoading}
            >
              Previous
            </Button>
          )}
          
          <div className="ml-auto">
            {currentStep < 2 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!formData.bio || !formData.experienceYears || !formData.phoneNumber || !formData.serviceAreas}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || formData.skillsAndExpertise.length === 0}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Setting up profile...
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}