declare module "react-simple-maps" {
    import * as React from "react";

    export interface ComposableMapProps {
        projection?: string | ((...args: unknown[]) => unknown);
        projectionConfig?: unknown;
        width?: number;
        height?: number;
        viewBox?: string;
        className?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }

    export interface GeographiesProps {
        geography: string | object | unknown[];
        children?: (data: { geographies: unknown[] }) => React.ReactNode;
        parseGeographies?: (geos: unknown[]) => unknown[];
    }

    export interface GeographyProps {
        geography: unknown;
        onMouseEnter?: React.MouseEventHandler;
        onMouseLeave?: React.MouseEventHandler;
        onMouseDown?: React.MouseEventHandler;
        onMouseUp?: React.MouseEventHandler;
        onFocus?: React.FocusEventHandler;
        onBlur?: React.BlurEventHandler;
        onClick?: React.MouseEventHandler;
        style?: {
            default?: React.CSSProperties;
            hover?: React.CSSProperties;
            pressed?: React.CSSProperties;
        };
        className?: string;
        fill?: string;
        stroke?: string;
        strokeWidth?: number | string;
    }

    export const ComposableMap: React.FC<ComposableMapProps>;
    export const Geographies: React.FC<GeographiesProps>;
    export const Geography: React.FC<GeographyProps>;
    export const ZoomableGroup: React.FC<Record<string, unknown>>;
    export const Marker: React.FC<Record<string, unknown>>;
    export const Annotation: React.FC<Record<string, unknown>>;
}

declare module "d3-scale" {
    export type ScaleOutput = string;

    export interface QuantileScale {
        domain(values: number[]): QuantileScale;
        range(values: ScaleOutput[]): QuantileScale;
        (value: number): ScaleOutput;
    }

    export function scaleLinear(): unknown;
    export function scaleLog(): unknown;
    export function scaleOrdinal(): unknown;
    export function scaleSequential(): unknown;
    export function scaleThreshold(): unknown;
    export function scaleQuantize(): unknown;
    export function scaleQuantile(): QuantileScale;
}
