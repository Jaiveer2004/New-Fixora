// Enhanced service creation form with modern design and better UX

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/services/apiService";
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

export function CreateServiceForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    isActive: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const promise = createService({
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration)
      });

      await toast.promise(promise, {
        loading: 'Creating your service...',
        success: () => {
          setTimeout(() => router.push('/partner/services'), 1500);
          return <b>Service created successfully!</b>;
        },
        error: (err) => {
          const errorMessage = err instanceof Error && 'response' in err && 
            err.response && typeof err.response === 'object' && 
            'data' in err.response && err.response.data && 
            typeof err.response.data === 'object' && 'message' in err.response.data
            ? String(err.response.data.message)
            : "Failed to create service!";
          return <b>{errorMessage}</b>;
        },
      });
    } catch (error) {
      console.error("Service creation failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestPrice = (category: string) => {
    const suggestions: Record<string, number> = {
      'Plumbing': 800,
      'Electrical': 900,
      'Cleaning': 500,
      'Home Repair': 700,
      'Appliance Repair': 1000,
      'HVAC': 1200,
      'Painting': 600,
      'Gardening': 400,
      'Moving': 1500,
      'Pest Control': 800,
      'IT Support': 1200,
      'Tutoring': 500,
      'Personal Training': 800,
      'Beauty & Wellness': 700,
      'Event Planning': 2000,
      'Photography': 2500,
      'Catering': 1800,
      'Pet Care': 600,
      'Automotive': 1000
    };
    
    return suggestions[category] || 500;
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      price: suggestPrice(category).toString()
    }));
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create New Service</h2>
        <p className="text-gray-400">Offer your expertise to customers on Fixora</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-white">
            Service Name
          </label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Professional Home Plumbing Repair"
            value={formData.name}
            onChange={handleChange}
            required
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {serviceCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  formData.category === category
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {formData.category === 'Other' && (
            <Input
              placeholder="Enter custom category"
              value={formData.category === 'Other' ? '' : formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="mt-2"
            />
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-white">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe your service in detail. What's included? What makes you special?"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Price and Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-white">
              Price (₹)
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="500"
              value={formData.price}
              onChange={handleChange}
              required
              min="50"
              max="10000"
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
            {formData.category && (
              <p className="text-xs text-gray-500">
                Suggested: ₹{suggestPrice(formData.category)} for {formData.category}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium text-white">
              Duration (minutes)
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select duration</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
              <option value="300">5 hours</option>
              <option value="360">6 hours</option>
              <option value="480">8 hours (Full day)</option>
            </select>
          </div>
        </div>

        {/* Service Status */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-white">
            Make this service active immediately
          </label>
        </div>

        {/* Preview */}
        {formData.name && formData.category && formData.price && (
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <h4 className="font-semibold text-white mb-2">Preview</h4>
            <div className="bg-gray-800 rounded-lg p-4">
              <h5 className="font-semibold text-white">{formData.name}</h5>
              <p className="text-sm text-gray-400 mb-2">{formData.category}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-bold">₹{formData.price}</span>
                {formData.duration && (
                  <span className="text-gray-400 text-sm">
                    {Number(formData.duration) >= 60 
                      ? `${Math.floor(Number(formData.duration) / 60)}h ${Number(formData.duration) % 60 ? Number(formData.duration) % 60 + 'm' : ''}`
                      : `${formData.duration}m`
                    }
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !formData.name || !formData.category || !formData.price || !formData.duration}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating service...
            </div>
          ) : (
            'Create Service'
          )}
        </Button>
      </form>
    </div>
  );
}