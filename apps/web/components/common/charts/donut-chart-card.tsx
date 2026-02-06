"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@red-salud/ui";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DonutChartCardProps {
    title: string;
    description?: string;
    data: any[];
    category: string;
    index: string;
    colors: string[];
    valueFormatter?: (number: number) => string;
    className?: string;
    height?: number;
}

const CustomTooltip = ({ active, payload, formatter }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: data.payload.fill }}
                    />
                    <span className="text-slate-500 dark:text-slate-400">
                        {data.name}:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatter ? formatter(data.value) : data.value}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function DonutChartCard({
    title,
    description,
    data,
    category,
    index,
    colors,
    valueFormatter = (val) => val.toString(),
    className,
    height = 350,
}: DonutChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div style={{ height }} className="animate-in fade-in zoom-in duration-500">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey={category}
                                nameKey={index}
                                strokeWidth={0}
                            >
                                {data.map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip formatter={valueFormatter} />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
