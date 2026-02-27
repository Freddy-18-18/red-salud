"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@red-salud/design-system";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AreaChartCardProps {
    title: string;
    description?: string;
    data: Record<string, unknown>[];
    categories: string[];
    colors: string[];
    index: string;
    valueFormatter?: (number: number) => string;
    className?: string;
    height?: number;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
    formatter?: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatter }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-black/95 border border-slate-200 dark:border-white/10 p-3 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    {label}
                </p>
                {payload.map((entry, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-500 dark:text-slate-400">
                            {entry.name}:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                            {formatter ? formatter(entry.value) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function AreaChartCard({
    title,
    description,
    data,
    categories,
    colors,
    index,
    valueFormatter = (val) => val.toString(),
    className,
    height = 350,
}: AreaChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div style={{ height }} className="animate-in fade-in zoom-in duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                {colors.map((color, i) => (
                                    <linearGradient key={color} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
                            <XAxis
                                dataKey={index}
                                className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={valueFormatter}
                            />
                            <Tooltip content={<CustomTooltip formatter={valueFormatter} />} cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            {categories.map((category, i) => (
                                <Area
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    stroke={colors[i]}
                                    fill={`url(#color-${i})`}
                                    strokeWidth={2}
                                    stackId={categories.length > 1 ? "1" : undefined}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
