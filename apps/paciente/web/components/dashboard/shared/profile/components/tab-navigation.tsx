import { motion } from "framer-motion";
import type { TabConfig, TabType } from "../types";

interface TabNavigationProps {
  tabs: TabConfig[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <nav
      className="px-8 border-b border-gray-200 shrink-0"
      aria-label="Navegación de perfil"
    >
      <div className="flex gap-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-3 px-3 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
