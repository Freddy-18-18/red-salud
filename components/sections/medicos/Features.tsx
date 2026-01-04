"use client";

import React from "react";
import {
  Calendar,
  Users,
  Video,
  FileText,
  CreditCard,
  TrendingUp,
} from "lucide-react";

interface FeatureItem {
  title: string;
  description: string;
  benefits?: string[];
  icon_name?: string;
}

interface FeaturesProps {
  data: FeatureItem[];
}

// Mapa de iconos disponibles
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  Users,
  Video,
  FileText,
  CreditCard,
  TrendingUp,
};

export function Features({ data }: FeaturesProps) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Herramientas profesionales a tu alcance
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Todo lo que necesitas para ofrecer atención médica de excelencia en el mundo digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((feature, index) => {
            const IconComponent = iconMap[feature.icon_name || ''] || Calendar;

            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
              >
                <div className="bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <IconComponent className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {feature.description}
                </p>
                {feature.benefits && feature.benefits.length > 0 && (
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}