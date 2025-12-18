"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'My Bookings', href: '/my-bookings', icon: '📅' },
  { name: 'Messages', href: '/messages', icon: '💬' },
  { 
    name: 'Browse Services', 
    href: '/services', 
    icon: '🔍',
    roles: ['customer']
  },
  { 
    name: 'My Services', 
    href: '/partner/services', 
    icon: '🛠️',
    roles: ['partner']
  },
  { 
    name: 'Create Service', 
    href: '/partner/services/create', 
    icon: '➕',
    roles: ['partner']
  },
  { 
    name: 'Become Partner', 
    href: '/partner/onboard', 
    icon: '⚙️',
    roles: ['customer']
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || 'customer');
  });

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-gray-800 overflow-y-auto shadow-xl border-r border-gray-700">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className="text-xl font-bold text-white">Fixora</h2>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="mr-3 text-lg" aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            {/* User info at bottom */}
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white group-hover:text-gray-200">
                      {user?.fullName}
                    </p>
                    <p className="text-xs font-medium text-gray-400 group-hover:text-gray-300 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="md:hidden bg-gray-800 shadow-lg p-4 border-b border-gray-700 mt-16">
            <h2 className="text-xl font-bold text-white">Fixora</h2>
          </div>
          
          {/* Main content area */}
          <main className="flex-1 bg-gray-900 pt-16">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}