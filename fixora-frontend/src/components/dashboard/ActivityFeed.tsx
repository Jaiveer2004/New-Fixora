"use client";

interface ActivityItem {
  id: string;
  type: 'booking' | 'service' | 'review' | 'payment';
  title: string;
  description: string;
  time: string;
  icon: string;
  status?: 'pending' | 'completed' | 'cancelled';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-blue-400 bg-blue-400/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'service':
        return '🛠️';
      case 'review':
        return '⭐';
      case 'payment':
        return '💳';
      default:
        return '📋';
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-gray-400">No recent activity</p>
          <p className="text-gray-500 text-sm">Your activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                  {activity.icon || getTypeIcon(activity.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    {activity.status && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {activity.time}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}