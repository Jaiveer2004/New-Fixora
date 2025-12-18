// Enhanced navigation bar with modern design and animations

"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    ...(user?.role === 'partner' ? [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'My Services', href: '/partner/services' },
      { name: 'Bookings', href: '/my-bookings' },
    ] : user?.role === 'customer' ? [
      { name: 'Services', href: '/services' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'My Bookings', href: '/my-bookings' },
    ] : [
      { name: 'Services', href: '/services' },
    ])
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800' 
        : 'bg-gray-900/90 backdrop-blur-sm'
    }`}>
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link 
          href='/' 
          className="text-2xl font-bold text-white hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          Fixora
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-blue-400 ${
                pathname === item.href 
                  ? 'text-blue-400' 
                  : 'text-gray-300'
              }`}
            >
              {item.name}
              {pathname === item.href && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{user.fullName}</span>
                  <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={logout}
                className="hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-200"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href='/login'>
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${
            isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
          }`} />
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${
            isMobileMenuOpen ? 'opacity-0' : ''
          }`} />
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${
            isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen ? 'max-h-screen bg-gray-900/95 backdrop-blur-md border-b border-gray-800' : 'max-h-0'
      }`}>
        <div className="px-4 py-6 space-y-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-lg ${
                pathname === item.href 
                  ? 'text-blue-400 bg-blue-400/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-center gap-3 px-3 py-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{user.fullName}</span>
                  <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full hover:bg-red-600 hover:border-red-600 hover:text-white"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-800 space-y-3">
              <Link href='/login' className="block">
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-300 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}