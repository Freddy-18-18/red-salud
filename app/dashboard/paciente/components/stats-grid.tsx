"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Pill, Beaker, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/hooks/use-i18n";
import type { DashboardStats } from "../hooks/use-dashboard-stats";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push("/dashboard/paciente/citas")}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {stats.upcomingAppointments}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("dashboard.upcomingAppointments")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {stats.totalConsultations} {t("dashboard.totalAppointments")}
          </p>
        </CardContent>
      </Card>

      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push("/dashboard/paciente/medicamentos")}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Pill className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {stats.activeMedications}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("dashboard.activeMedications")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {t("dashboard.remindersConfigured")}
          </p>
        </CardContent>
      </Card>

      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push("/dashboard/paciente/laboratorio")}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Beaker className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {stats.pendingLabResults}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("dashboard.pendingResults")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {t("dashboard.documentsToUpload")}
          </p>
        </CardContent>
      </Card>

      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push("/dashboard/paciente/mensajeria")}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              {stats.unreadMessages}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("dashboard.unreadMessages")}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {t("dashboard.activeConversations")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
