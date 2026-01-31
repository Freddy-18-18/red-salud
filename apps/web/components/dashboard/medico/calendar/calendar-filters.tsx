"use client";

import { Button } from "@red-salud/ui";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { X, Filter } from "lucide-react";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from "./types";

interface CalendarFiltersProps {
    selectedStatuses: string[];
    onStatusChange: (statuses: string[]) => void;
    selectedTypes: string[];
    onTypeChange: (types: string[]) => void;
    className?: string;
}

export function CalendarFilters({
    selectedStatuses,
    onStatusChange,
    selectedTypes,
    onTypeChange,
    className,
}: CalendarFiltersProps) {
    const statusKeys = Object.keys(APPOINTMENT_STATUS_LABELS) as Array<
        keyof typeof APPOINTMENT_STATUS_LABELS
    >;
    const typeKeys = Object.keys(APPOINTMENT_TYPE_LABELS) as Array<
        keyof typeof APPOINTMENT_TYPE_LABELS
    >;

    const toggleStatus = (status: string) => {
        if (selectedStatuses.includes(status)) {
            onStatusChange(selectedStatuses.filter((s) => s !== status));
        } else {
            onStatusChange([...selectedStatuses, status]);
        }
    };

    const toggleType = (type: string) => {
        if (selectedTypes.includes(type)) {
            onTypeChange(selectedTypes.filter((t) => t !== type));
        } else {
            onTypeChange([...selectedTypes, type]);
        }
    };

    const clearFilters = () => {
        onStatusChange([]);
        onTypeChange([]);
    };

    const hasFilters = selectedStatuses.length > 0 || selectedTypes.length > 0;

    return (
        <div className={`flex flex-wrap items-center gap-2 w-full sm:w-auto ${className}`}>
            {/* Status Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed flex-1 sm:flex-none justify-center">
                        <Filter className="mr-2 h-3.5 w-3.5" />
                        Estados
                        {selectedStatuses.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-2 rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedStatuses.length}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusKeys.map((status) => (
                        <DropdownMenuCheckboxItem
                            key={status}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                        >
                            {APPOINTMENT_STATUS_LABELS[status]}
                        </DropdownMenuCheckboxItem>
                    ))}
                    {selectedStatuses.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={false}
                                onCheckedChange={() => onStatusChange([])}
                                className="justify-center text-center"
                            >
                                Limpiar estados
                            </DropdownMenuCheckboxItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed flex-1 sm:flex-none justify-center">
                        <Filter className="mr-2 h-3.5 w-3.5" />
                        Tipo
                        {selectedTypes.length > 0 && (
                            <Badge
                                variant="secondary"
                                className="ml-2 rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedTypes.length}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {typeKeys.map((type) => (
                        <DropdownMenuCheckboxItem
                            key={type}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => toggleType(type)}
                        >
                            {APPOINTMENT_TYPE_LABELS[type]}
                        </DropdownMenuCheckboxItem>
                    ))}
                    {selectedTypes.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={false}
                                onCheckedChange={() => onTypeChange([])}
                                className="justify-center text-center"
                            >
                                Limpiar tipos
                            </DropdownMenuCheckboxItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Active filters display (Desktop mainly) */}
            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 lg:px-3"
                >
                    Limpiar filtros
                    <X className="ml-2 h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
}
