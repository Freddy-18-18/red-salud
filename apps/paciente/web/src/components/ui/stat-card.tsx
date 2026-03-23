import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  href?: string;
}

export function StatCard({ icon: Icon, label, value, color = "bg-emerald-50 text-emerald-600", href }: StatCardProps) {
  const Wrapper = href ? "a" : "div";
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`p-4 bg-white border border-gray-100 rounded-xl ${href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </Wrapper>
  );
}
