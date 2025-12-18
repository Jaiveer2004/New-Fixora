"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";
import { FixoraLoader } from "@/components/shared/FixoraLoader";
import { PageTransition } from "@/components/shared/PageTransition";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { getAllServices } from "@/services/apiService";

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  partner: {
    user: {
      fullName: string;
      profilePicture: string;
    };
    bio: string;
    averageRating: number;
  };
  reviewCount: number;
  averageRating: number;
}

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getAllServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadingComplete = () => {
    setShowLoader(false);
  };

  // Show loader while initial loading
  if (showLoader) {
    return <FixoraLoader onLoadingComplete={handleLoadingComplete} />;
  }

  const serviceCategories = [
    {
      id: 1,
      title: "Cleaning & Pest Control",
      icon: "🧽",
      services: ["Home Cleaning", "Bathroom Cleaning", "Kitchen Cleaning", "Pest Control"]
    },
    {
      id: 2,
      title: "Appliance Repair",
      icon: "🔧",
      services: ["AC Service", "Washing Machine", "TV Repair", "Refrigerator"]
    },
    {
      id: 3,
      title: "Home Repair & Installation",
      icon: "🔨",
      services: ["Plumber", "Electrician", "Carpenter", "Painter"]
    },
    {
      id: 4,
      title: "Beauty & Wellness",
      icon: "💄",
      services: ["Salon for Women", "Spa Services", "Men's Grooming", "Massage"]
    }
  ];

  // Get featured services (most reviewed or highest rated)
  const featuredServices = services
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 4);

  // Get services by category
  const getServicesByCategory = (categoryName: string) => {
    const categoryMap: { [key: string]: string[] } = {
      'Cleaning & Pest Control': ['Cleaning', 'Pest Control'],
      'Appliance Repair': ['Appliance'],
      'Home Repair & Installation': ['Home Repair'],
      'Beauty & Wellness': ['Beauty']
    };
    
    const categories = categoryMap[categoryName] || [];
    return services.filter(service => 
      categories.some(cat => service.category.toLowerCase().includes(cat.toLowerCase()))
    ).slice(0, 6);
  };

  const formatReviewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Hero Section with Search */}
      <section className="pt-24 pb-8 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Home services at your 
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent block">
              doorstep
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Trusted professionals for all your home service needs
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 text-lg rounded-2xl border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">4.8</div>
              <div className="text-gray-400">Service Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">50K+</div>
              <div className="text-gray-400">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">{services.length}+</div>
              <div className="text-gray-400">Services Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What are you looking for?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {serviceCategories.map((category) => (
              <Link key={category.id} href="/services" className="group">
                <div className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-700 transition-all duration-300 hover:scale-105 border border-gray-700">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                    {category.title}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {category.services.slice(0, 2).join(", ")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Most booked services</h2>
            <Link href="/services" className="text-blue-400 hover:text-blue-300 font-medium">
              See all →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 animate-pulse">
                  <div className="h-48 bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded mb-4 w-2/3"></div>
                    <div className="h-3 bg-gray-700 rounded mb-4 w-1/2"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-700 rounded w-16"></div>
                      <div className="h-8 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service) => (
                <Link key={service._id} href={`/services/${service._id}`} className="group">
                  <div className="bg-gray-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-700">
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative flex items-center justify-center">
                      <span className="text-6xl">🏠</span>
                      <div className="absolute top-4 left-4">
                        <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                          {service.reviewCount > 100 ? 'Most Booked' : 'Popular'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">{service.category}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-white font-medium ml-1">
                              {service.averageRating ? service.averageRating.toFixed(1) : '4.5'}
                            </span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            ({formatReviewCount(service.reviewCount || 0)})
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">₹{service.price}</span>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Service Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto space-y-16">
          {serviceCategories.map((category) => {
            const categoryServices = getServicesByCategory(category.title);
            return (
              <div key={category.id}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">{category.title}</h2>
                  <Link href="/services" className="text-blue-400 hover:text-blue-300 font-medium">
                    See all →
                  </Link>
                </div>
                
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
                        <div className="h-20 bg-gray-700 rounded-lg mb-3"></div>
                        <div className="h-4 bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : categoryServices.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categoryServices.map((service) => (
                      <Link key={service._id} href={`/services/${service._id}`} className="group">
                        <div className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-700 transition-all duration-300 border border-gray-700">
                          <div className={`h-20 rounded-lg mb-3 flex items-center justify-center ${
                            category.id === 1 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                            category.id === 2 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            category.id === 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                            'bg-gradient-to-br from-pink-500 to-pink-600'
                          }`}>
                            <span className="text-2xl">{category.icon}</span>
                          </div>
                          <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors mb-1">
                            {service.name}
                          </h3>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-xs text-gray-400">
                              {service.averageRating ? service.averageRating.toFixed(1) : '4.5'}
                            </span>
                          </div>
                          <p className="text-xs text-blue-400 font-medium">₹{service.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {category.services.map((service, index) => (
                      <Link key={index} href="/services" className="group">
                        <div className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-700 transition-all duration-300 border border-gray-700">
                          <div className={`h-20 rounded-lg mb-3 flex items-center justify-center ${
                            category.id === 1 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                            category.id === 2 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            category.id === 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                            'bg-gradient-to-br from-pink-500 to-pink-600'
                          }`}>
                            <span className="text-2xl">{category.icon}</span>
                          </div>
                          <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                            {service}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Fixora for their home service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/services">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                  Book a Service
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                    Get Started
                  </Button>
                </Link>
                <Link href="/partner/onboard">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold">
                    Become a Partner
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="text-xl font-bold text-white">Fixora</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted platform for professional home services. Quality guaranteed.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services" className="hover:text-white transition-colors">All Services</Link></li>
                <li><Link href="/reviews" className="hover:text-white transition-colors">Reviews</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">For Partners</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/partner/onboard" className="hover:text-white transition-colors">Join as Partner</Link></li>
                <li><Link href="/partner/support" className="hover:text-white transition-colors">Partner Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Fixora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </PageTransition>
  );
}
