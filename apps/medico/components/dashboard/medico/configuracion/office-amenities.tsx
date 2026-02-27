"use client";

import { OFFICE_AMENITIES } from "@/lib/data/office-options";
import { Checkbox } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";

interface OfficeAmenitiesProps {
    value: Record<string, boolean> | undefined;
    onChange: (value: Record<string, boolean>) => void;
}

export function OfficeAmenities({ value = {}, onChange }: OfficeAmenitiesProps) {
    const handleToggle = (id: string, checked: boolean) => {
        onChange({
            ...value,
            [id]: checked
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Servicios y Comodidades
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Selecciona los servicios que ofrece este consultorio para informar a tus pacientes.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {OFFICE_AMENITIES.map((amenity) => {
                    const Icon = amenity.icon;
                    const isChecked = value[amenity.id] || false;

                    return (
                        <div
                            key={amenity.id}
                            className={`
                                flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all
                                ${isChecked
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                                }
                            `}
                            onClick={() => handleToggle(amenity.id, !isChecked)}
                        >
                            <Checkbox
                                id={`amenity-${amenity.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => handleToggle(amenity.id, checked === true)}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${isChecked ? "text-blue-600" : "text-gray-500"}`} />
                                <Label
                                    htmlFor={`amenity-${amenity.id}`}
                                    className="text-xs font-medium cursor-pointer"
                                >
                                    {amenity.label}
                                </Label>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
