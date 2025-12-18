"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration?: number;
  providerCount?: number;
  reviewCount?: number;
  averageRating?: number;
  sampleProvider?: {
    name: string;
    rating: number;
  };
}

interface ServiceCardProps {
  service: Service;
}

// Service category placeholder images mapping
const getServiceImage = (serviceName: string, category: string) => {
  // Using data URLs for placeholder images to avoid external dependencies
  const placeholderImages: { [key: string]: string } = {
    // Cleaning Services
    "Full Home Deep Cleaning": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM2MzY2ZjEiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DbGVhbmluZzwvdGV4dD4KPC9zdmc+",
    "Bathroom Deep Cleaning": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM2MzY2ZjEiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CYXRocm9vbTwvdGV4dD4KPC9zdmc+",
    "Kitchen Deep Cleaning": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM2MzY2ZjEiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5LaXRjaGVuPC90ZXh0Pgo8L3N2Zz4=",
    "Sofa Cleaning": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM2MzY2ZjEiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Tb2ZhPC90ZXh0Pgo8L3N2Zz4=",
    
    // Appliance Repair
    "AC Service & Repair": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiMxMGI5ODEiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BQyBSZXBhaXI8L3RleHQ+Cjwvc3ZnPg==",
    "Washing Machine Repair": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiMxMGI5ODEiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XYXNoaW5nPC90ZXh0Pgo8L3N2Zz4=",
    "Refrigerator Repair": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiMxMGI5ODEiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GcmlkZ2U8L3RleHQ+Cjwvc3ZnPg==",
    
    // Home Repair
    "Plumber Service": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiNmNTk3MTYiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QbHVtYmVyPC90ZXh0Pgo8L3N2Zz4=",
    "Electrician Service": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiNmNTk3MTYiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FbGVjdHJpY2lhbjwvdGV4dD4KPC9zdmc+",
    "Carpenter Service": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiNmNTk3MTYiLz4KPHR4dCB4PSIyMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWZhMmE3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DYXJwZW50ZXI8L3RleHQ+Cjwvc3ZnPg=="
  };

  // Fallback based on category if specific service not found
  const categoryColors: { [key: string]: string } = {
    "Cleaning": "#6366f1", // Blue
    "Appliance Repair": "#10b981", // Green
    "Home Repair": "#f59716", // Orange
    "Beauty": "#ec4899" // Pink
  };

  if (placeholderImages[serviceName]) {
    return placeholderImages[serviceName];
  }

  // Generate a category-based placeholder
  const color = categoryColors[category] || "#6366f1";
  const categoryText = category.replace(/\s+/g, ' ').substring(0, 12);
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#374151"/>
      <circle cx="200" cy="150" r="40" fill="${color}"/>
      <text x="200" y="200" font-family="Arial" font-size="14" fill="#9fa2a7" text-anchor="middle">${categoryText}</text>
    </svg>
  `)}`;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const imageUrl = getServiceImage(service.name, service.category);

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-500 overflow-hidden">
      {/* Service Image */}
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={service.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="text-sm text-blue-400 font-medium bg-blue-900/80 px-3 py-1 rounded-full backdrop-blur-sm">
            {service.category}
          </span>
        </div>
        
        {/* Provider count badge */}
        {service.providerCount && (
          <div className="absolute top-4 right-4">
            <span className="text-xs bg-green-600/90 text-white px-2 py-1 rounded-full backdrop-blur-sm">
              {service.providerCount} providers
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3">{service.name}</h3>
        
        {service.sampleProvider && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-gray-300">
                {service.averageRating?.toFixed(1) || '4.5'}
              </span>
            </div>
            {service.reviewCount && (
              <span className="text-xs text-gray-400">
                ({service.reviewCount > 1000 ? `${(service.reviewCount/1000).toFixed(1)}k` : service.reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {service.duration && (
          <p className="text-sm text-gray-400 mb-4">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {service.duration} minutes
            </span>
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">₹{service.price}</p>
            <p className="text-xs text-gray-400">Starting price</p>
          </div>
          <Link href={`/service-providers/${encodeURIComponent(service.name)}`}>
            <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-2">
              View Providers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}