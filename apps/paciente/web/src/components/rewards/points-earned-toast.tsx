"use client";

import { useEffect, useState } from "react";
import { Sparkles, Trophy, X } from "lucide-react";

interface PointsNotification {
  id: string;
  points: number;
  description: string;
  leveledUp: boolean;
  newLevel?: number;
}

interface BadgeNotification {
  id: string;
  badge: {
    name: string;
    icon: string;
    description: string;
  };
}

interface PointsEarnedToastProps {
  pointsNotifications: PointsNotification[];
  badgeNotifications: BadgeNotification[];
  onDismissPoints: (id: string) => void;
  onDismissBadge: (id: string) => void;
}

export function PointsEarnedToast({
  pointsNotifications,
  badgeNotifications,
  onDismissPoints,
  onDismissBadge,
}: PointsEarnedToastProps) {
  if (pointsNotifications.length === 0 && badgeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {/* Points Toasts */}
      {pointsNotifications.map((notif) => (
        <PointsToast
          key={notif.id}
          notification={notif}
          onDismiss={() => onDismissPoints(notif.id)}
        />
      ))}

      {/* Badge Toasts */}
      {badgeNotifications.map((notif) => (
        <BadgeToast
          key={notif.id}
          notification={notif}
          onDismiss={() => onDismissBadge(notif.id)}
        />
      ))}
    </div>
  );
}

function PointsToast({
  notification,
  onDismiss,
}: {
  notification: PointsNotification;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white border border-amber-200 rounded-xl shadow-lg shadow-amber-100/50 transition-all duration-500 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 opacity-0"
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
        {notification.leveledUp ? (
          <Trophy className="h-5 w-5 text-white" />
        ) : (
          <Sparkles className="h-5 w-5 text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-600">
          +{notification.points} puntos
        </p>
        <p className="text-xs text-gray-500 truncate">
          {notification.description}
        </p>
        {notification.leveledUp && notification.newLevel && (
          <p className="text-xs font-semibold text-amber-700 mt-0.5">
            Subiste al nivel {notification.newLevel}!
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="p-1 text-gray-300 hover:text-gray-500 transition flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function BadgeToast({
  notification,
  onDismiss,
}: {
  notification: BadgeNotification;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white border border-emerald-200 rounded-xl shadow-lg shadow-emerald-100/50 transition-all duration-500 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 opacity-0"
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
        <span className="text-lg">{notification.badge.icon || "🏅"}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-emerald-600">
          Nueva insignia!
        </p>
        <p className="text-xs text-gray-500 truncate">
          {notification.badge.name}
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="p-1 text-gray-300 hover:text-gray-500 transition flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
