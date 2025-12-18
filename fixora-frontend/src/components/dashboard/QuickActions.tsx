"use client";

import Link from "next/link";

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

interface QuickActionsProps {
  userRole: string;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const customerActions: QuickAction[] = [
    {
      title: "Book a Service",
      description: "Find and book professional services",
      icon: "🔍",
      href: "/services",
      color: "blue"
    },
    {
      title: "My Bookings",
      description: "View your current and past bookings",
      icon: "📅",
      href: "/my-bookings",
      color: "green"
    },
    {
      title: "Profile Settings",
      description: "Manage account & security",
      icon: "⚙️",
      href: "/profile",
      color: "purple"
    }
  ];

  const partnerActions: QuickAction[] = [
    {
      title: "Create Service",
      description: "Add a new service offering",
      icon: "➕",
      href: "/partner/services/create",
      color: "blue"
    },
    {
      title: "My Services",
      description: "Manage your service listings",
      icon: "🛠️",
      href: "/partner/services",
      color: "green"
    },
    {
      title: "Profile Settings",
      description: "Manage account & security",
      icon: "⚙️",
      href: "/profile",
      color: "purple"
    }
  ];

  const actions = userRole === 'partner' ? partnerActions : customerActions;

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <div className={`bg-gradient-to-br ${colorClasses[action.color]} rounded-xl p-4 text-white hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}>
              <div className="text-2xl mb-2">{action.icon}</div>
              <h4 className="font-semibold mb-1">{action.title}</h4>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}