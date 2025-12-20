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
        ? 'bg-black/95 backdrop-blur-md shadow-lg border-b border-gray-900' 
        : 'bg-black/90 backdrop-blur-sm'
    }`}>
      <nav className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <Link 
          href='/' 
          className="text-lg sm:text-2xl font-bold text-white hover:text-gray-300 transition-colors duration-200 flex items-center gap-1.5 sm:gap-2 touch-feedback"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-xs sm:text-sm">F</span>
          </div>
          <span className="hidden xs:inline">Fixora</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-white ${
                pathname === item.href 
                  ? 'text-white' 
                  : 'text-gray-500'
              }`}
            >
              {item.name}
              {pathname === item.href && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-semibold text-sm">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{user.fullName}</span>
                  <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={logout}
                className="hover:bg-gray-900 hover:border-gray-800 hover:text-white transition-all duration-200"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href='/login'>
                <Button variant="ghost" className="text-gray-500 hover:text-white hover:bg-gray-950 text-sm px-3 sm:px-4">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white hover:bg-gray-200 text-black border-none shadow-lg hover:shadow-xl transition-all duration-200 text-sm px-3 sm:px-4">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button - Enhanced */}
        <button
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-950 transition-colors touch-feedback"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${
            isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
          }`} />
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 my-1 ${
            isMobileMenuOpen ? 'opacity-0' : ''
          }`} />
          <div className={`w-5 h-0.5 bg-white transition-all duration-300 ${
            isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`} />
        </button>
      </nav>

      {/* Mobile Menu - Enhanced */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen ? 'max-h-screen bg-black/98 backdrop-blur-lg border-b border-gray-900 shadow-2xl' : 'max-h-0'
      }`}>
        <div className="px-4 py-6 space-y-2">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-4 py-3 text-base font-medium transition-all duration-200 rounded-xl ${
                pathname === item.href 
                  ? 'text-white bg-gray-950 shadow-md' 
                  : 'text-gray-500 hover:text-white hover:bg-gray-950 active:bg-gray-900'
              } touch-feedback animate-slideIn`}
              style={{animationDelay: `${index * 50}ms`}}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <div className="pt-4 border-t border-gray-900 space-y-4 animate-slideIn" style={{animationDelay: `${navigation.length * 50}ms`}}>
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-black font-semibold text-lg">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-medium text-white">{user.fullName}</span>
                  <span className="text-sm text-gray-500 capitalize">{user.role}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full hover:bg-gray-900 hover:border-gray-800 hover:text-white h-12 text-base touch-feedback"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-900 space-y-3 animate-slideIn" style={{animationDelay: `${navigation.length * 50}ms`}}>
              <Link href='/login' className="block">
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-500 hover:text-white hover:bg-gray-950 h-12 text-base touch-feedback"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button 
                  className="w-full bg-white hover:bg-gray-200 text-black border-none shadow-lg h-12 text-base touch-feedback"
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