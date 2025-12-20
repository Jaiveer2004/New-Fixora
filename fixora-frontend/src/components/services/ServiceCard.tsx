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

// Professional service images with icon-based designs
const getServiceImage = (serviceName: string, category: string) => {
  // Generate professional SVG with icons for each category
  const createServiceImage = (iconSvg: string, gradientStart: string, gradientEnd: string, title: string) => {
    const svg = `
      <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradientStart};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradientEnd};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <g transform="translate(200, 140)">
          ${iconSvg}
        </g>
        <text x="200" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="white" text-anchor="middle" opacity="0.9">${title}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Cleaning Services Icons
  const cleaningIcon = '<path d="M-20,-30 L-20,30 L-15,30 L-15,-30 Z M-15,-25 L10,-10 L10,-5 L-15,-20 Z" fill="white" stroke="white" stroke-width="2"/><circle cx="15" cy="0" r="8" fill="white" opacity="0.6"/><circle cx="18" cy="12" r="6" fill="white" opacity="0.4"/>';
  const bathIcon = '<rect x="-25" y="-10" width="50" height="30" rx="5" fill="white" opacity="0.2"/><path d="M-20,5 Q-20,0 -15,0 L15,0 Q20,0 20,5 L20,15 Q20,20 15,20 L-15,20 Q-20,20 -20,15 Z" fill="white"/><circle cx="-15" cy="-5" r="3" fill="white"/><circle cx="0" cy="-5" r="3" fill="white"/><circle cx="15" cy="-5" r="3" fill="white"/>';
  const kitchenIcon = '<rect x="-20" y="-20" width="40" height="40" rx="3" fill="white"/><rect x="-15" y="-15" width="30" height="5" fill="#374151"/><circle cx="-7" cy="0" r="8" fill="#374151" opacity="0.3"/><circle cx="7" cy="0" r="8" fill="#374151" opacity="0.3"/>';
  const sofaIcon = '<path d="M-30,-5 L-25,-15 L-20,-15 L-20,15 L-30,15 Z M30,-5 L25,-15 L20,-15 L20,15 L30,15 Z M-20,-10 L20,-10 L20,10 L-20,10 Z" fill="white"/>';

  // Appliance Repair Icons
  const acIcon = '<rect x="-30" y="-15" width="60" height="30" rx="3" fill="white"/><path d="M-20,-5 L-20,5 M-10,-5 L-10,5 M0,-5 L0,5 M10,-5 L10,5 M20,-5 L20,5" stroke="#10b981" stroke-width="2"/><circle cx="-20" cy="-10" r="2" fill="#10b981"/><circle cx="-10" cy="-10" r="2" fill="#10b981"/>';
  const washingIcon = '<circle cx="0" cy="0" r="25" fill="white"/><circle cx="0" cy="0" r="18" fill="#1e293b"/><circle cx="0" cy="0" r="12" fill="white" opacity="0.3"/><circle cx="0" cy="-20" r="3" fill="#10b981"/><circle cx="10" cy="-20" r="3" fill="#3b82f6"/>';
  const fridgeIcon = '<rect x="-20" y="-28" width="40" height="56" rx="2" fill="white"/><line x1="-20" y1="0" x2="20" y2="0" stroke="#1e293b" stroke-width="2"/><rect x="-15" y="-20" width="5" height="8" rx="1" fill="#374151"/><rect x="-15" y="5" width="5" height="8" rx="1" fill="#374151"/>';

  // Home Repair Icons
  const plumberIcon = '<path d="M-25,10 L-25,20 L25,20 L25,10 Q25,0 20,-5 L10,-5 L10,-15 Q10,-20 5,-20 L-5,-20 Q-10,-20 -10,-15 L-10,-5 L-20,-5 Q-25,0 -25,10 Z" fill="white"/><circle cx="0" cy="10" r="4" fill="#374151"/>';
  const electricianIcon = '<path d="M-5,-25 L15,0 L5,0 L5,25 L-15,0 L-5,0 Z" fill="white"/><circle cx="0" cy="0" r="30" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>';
  const carpenterIcon = '<path d="M-25,-20 L-20,-25 L20,15 L15,20 Z M-20,-15 L-15,-20 L10,5 L0,0 Z" fill="white"/><rect x="10" y="-25" width="4" height="50" rx="1" fill="white" opacity="0.6" transform="rotate(45 12 0)"/>';

  // Beauty & Wellness Icons
  const beautyIcon = '<path d="M0,-20 C-15,-20 -20,-10 -20,5 C-20,20 0,25 0,25 C0,25 20,20 20,5 C20,-10 15,-20 0,-20 Z" fill="white"/><circle cx="-6" cy="-5" r="3" fill="#ec4899"/><circle cx="6" cy="-5" r="3" fill="#ec4899"/><path d="M-8,5 Q0,10 8,5" stroke="#ec4899" stroke-width="2" fill="none"/>';

  // Map services to their respective images
  const serviceImages: { [key: string]: string } = {
    // Cleaning
    "Full Home Deep Cleaning": createServiceImage(cleaningIcon, "#6366f1", "#4f46e5", "Home Cleaning"),
    "Bathroom Deep Cleaning": createServiceImage(bathIcon, "#6366f1", "#4f46e5", "Bathroom"),
    "Kitchen Deep Cleaning": createServiceImage(kitchenIcon, "#6366f1", "#4f46e5", "Kitchen"),
    "Sofa Cleaning": createServiceImage(sofaIcon, "#6366f1", "#4f46e5", "Sofa Care"),
    
    // Appliance Repair
    "AC Service & Repair": createServiceImage(acIcon, "#10b981", "#059669", "AC Repair"),
    "Washing Machine Repair": createServiceImage(washingIcon, "#10b981", "#059669", "Washing Machine"),
    "Refrigerator Repair": createServiceImage(fridgeIcon, "#10b981", "#059669", "Refrigerator"),
    
    // Home Repair
    "Plumber Service": createServiceImage(plumberIcon, "#f59e0b", "#d97706", "Plumbing"),
    "Electrician Service": createServiceImage(electricianIcon, "#f59e0b", "#d97706", "Electrical"),
    "Carpenter Service": createServiceImage(carpenterIcon, "#f59e0b", "#d97706", "Carpentry"),
  };

  if (serviceImages[serviceName]) {
    return serviceImages[serviceName];
  }

  // Fallback based on category
  const categoryDefaults: { [key: string]: { icon: string; start: string; end: string } } = {
    "Cleaning": { icon: cleaningIcon, start: "#6366f1", end: "#4f46e5" },
    "Appliance Repair": { icon: acIcon, start: "#10b981", end: "#059669" },
    "Home Repair": { icon: plumberIcon, start: "#f59e0b", end: "#d97706" },
    "Beauty": { icon: beautyIcon, start: "#ec4899", end: "#db2777" },
  };

  const categoryDefault = categoryDefaults[category] || categoryDefaults["Cleaning"];
  const displayName = serviceName.length > 20 ? serviceName.substring(0, 20) + "..." : serviceName;
  
  return createServiceImage(categoryDefault.icon, categoryDefault.start, categoryDefault.end, displayName);
};

export function ServiceCard({ service }: ServiceCardProps) {
  const imageUrl = getServiceImage(service.name, service.category);

  return (
    <div className="rounded-xl border border-gray-900 bg-black/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-gray-800 overflow-hidden">
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
          <span className="text-sm text-white font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-900">
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
            <Button className="bg-white hover:bg-gray-200 text-black px-6 py-2">
              View Providers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}