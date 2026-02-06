"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@red-salud/ui";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartCardProps {
    title: string;
    description?: string;
    data: any[];
    categories: string[];
    colors: string[];
    index: string;
    valueFormatter?: (number: number) => string;
    className?: string;
    height?: number;
    layout?: "vertical" | "horizontal";
    stack?: boolean;
}

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                    {label}
                </p>
                {payload.map((entry: any, index: number) => (
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

export function BarChartCard({
    title,
    description,
    data,
    categories,
    colors,
    index,
    valueFormatter = (val) => val.toString(),
    className,
    height = 350,
    layout = "horizontal",
    stack = false,
}: BarChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div style={{ height }} className="animate-in fade-in zoom-in duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout={layout}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} horizontal={layout === 'horizontal'} />
                            {layout === 'horizontal' ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    <XAxis
                                        type="number"
                                        className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={valueFormatter}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey={index}
                                        className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                                        tickLine={false}
                                        axisLine={false}
                                        width={100}
                                    />
                                </>
                            )}
                            <Tooltip content={<CustomTooltip formatter={valueFormatter} />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                            {categories.map((category, i) => (
                                <Bar
                                    key={category}
                                    dataKey={category}
                                    fill={colors[i]}
                                    radius={layout === 'horizontal' ? [4, 4, 0, 0] : [0, 4, 4, 0]}
                                    stackId={stack ? "a" : undefined}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
