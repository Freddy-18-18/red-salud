"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Pill, Beaker, MessageSquare, Video, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { RecentActivity } from "../hooks/use-dashboard-data";

interface RecentActivityProps {
  activities: RecentActivity[];
}

export function RecentActivitySection({ activities }: RecentActivityProps) {
  const { t } = useI18n();

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      appointment_created: Calendar,
      appointment_cancelled: Calendar,
      prescription_created: Pill,
      lab_order_created: Beaker,
      message_sent: MessageSquare,
      telemedicine_session_created: Video,
      profile_updated: User,
      metric_recorded: Activity,
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (status: string) => {
    const colors: Record<string, string> = {
      success: "text-green-600 bg-green-50",
      error: "text-red-600 bg-red-50",
      warning: "text-yellow-600 bg-yellow-50",
      info: "text-blue-600 bg-blue-50",
    };
    return colors[status] || colors.info;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
        <CardDescription>
          {t("dashboard.recentActivity")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.activity_type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${getActivityColor(
                      activity.status
                    )}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(activity.created_at), "PPp", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            {t("dashboard.noActivity")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
