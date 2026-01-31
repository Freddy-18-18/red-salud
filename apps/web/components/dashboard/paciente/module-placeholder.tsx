import { Card } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { LucideIcon } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
}

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  features = [],
}: ModulePlaceholderProps) {
  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Placeholder Content */}
        <Card className="p-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
              <Icon className="h-10 w-10 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {title} en Construcción
            </h2>

            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Este módulo está siendo desarrollado. Pronto podrás acceder a
              todas las funcionalidades.
            </p>

            {features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Próximas funcionalidades:
                </h3>
                <ul className="space-y-2 text-left max-w-md mx-auto">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="outline">Volver a Vista General</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
